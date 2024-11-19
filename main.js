import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import axios from "axios";

const URL_BASE = 'https://app.uff.br/transparencia';

export const execute = async (list) => {
    let listData = [];
    const previousList = await getPreviousData(list);
    for (const previousData of previousList) {
        try {
            listData = await extractData(listData, previousData);
        }
        catch (error) {
            console.error(error);
        }
    }
    generateJsonFile(listData);
    return listData;
}

const generateJsonFile = (listData) => {
    const jsonData = JSON.stringify(listData, null, 2);
    fs.writeFile('usuarios-uff.json', jsonData, (err) => {
        if (err) {
            console.error("Erro ao criar o arquivo:", err);
        } else {
            console.log("Arquivo JSON criado com sucesso!");
        }
    });
}

const extractData = async (listData, previousData) => {
    const url = `${URL_BASE}/busca_cadastro_pessoa?cpf=${previousData.cpf}&ididentificacao=${previousData.identificacao}&tipo=`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    const listUserDetails = await page.evaluate(() => {
        const tables = document.querySelectorAll('table#cadastro-pessoal-ALUNO');
        const allTablesData = [];
        tables.forEach((table) => {
            const rows = table.querySelectorAll('tbody tr');
            const tableData = {};
            rows.forEach((row) => {
                const cells = row.querySelectorAll('td');
                const key = cells[0].textContent.trim();
                const value = cells[1].textContent.trim();
                tableData[key] = value;
            });
            allTablesData.push(tableData);
        });
        return allTablesData;
    })
    await browser.close();
    return handleExtractedData(listData, listUserDetails, previousData);
}

const handleExtractedData = (listData, listUserDetails, previousData) => {
    let userDetails = { Nome: previousData.nome };
    const mostCurrentData = listUserDetails.find(user => {
        const isGraduated = user.Status.toLowerCase().includes('formado');
        const isActived = user.Status.toLowerCase().includes('ativo');
        return isGraduated || isActived;
    });
    if(!mostCurrentData)
        userDetails = { ...userDetails, ...listUserDetails[0]};
    userDetails = { ...userDetails, ...mostCurrentData };
    listData.push(userDetails);
    return listData;
}

const getPreviousData = async (elementList) => {
    const previousUserDataPromise = elementList.map(elem => {
        let term = elem || '';
        if (isNaN(parseFloat(elem)))
            term = term.trim().replaceAll(' ', '+');
        return axios.get(`${URL_BASE}/busca_cadastro.json?term=${term}`);
    });
    const previousResolvedPromises = await Promise.all(previousUserDataPromise);
    const previousList = previousResolvedPromises.map((res, i) => {
        let data = PreviousUserData(res.data);
        if (!data)
            console.log(`ELEMENTO '${elementList[i]}' NAO ENCONTRADO`);
        return data;
    });
    return previousList.filter(data => data);
}

const PreviousUserData = (resData) => {
    if (!resData || resData.length === 0) return null;
    const { cpf, nome, ididentificacao } = resData[0].pessoa;
    return { cpf, nome, identificacao: ididentificacao };
};

const parseArgs = (args) => {
    const parsed = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('-')) {
            const key = args[i].replace('-', '');
            const value = args[i + 1]?.startsWith('-') ? true : args[i + 1];
            parsed[key] = value || true;
        }
    }
    return parsed;
};

const args = process.argv.slice(2);
const parsedArgs = parseArgs(args);

if (parsedArgs.list) {
    const stringList = parsedArgs.list.split(',').map(elem => elem.trim());
    await execute(stringList);
}
