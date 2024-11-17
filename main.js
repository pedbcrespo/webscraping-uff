import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import axios from "axios";

const URL_BASE = 'https://app.uff.br/transparencia';

export const execute = async (list) => {
    let listData = [];
    const previousList = await getPreviousData(list);
    if (previousList.some(data => !data)) {
        console.error("LISTA COM DADOS INVALIDOS", list)
        return [];
    }
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
    fs.writeFile('data.json', jsonData, (err) => {
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

    const data = await page.evaluate(() => {
        const tds = Array.from(document.querySelectorAll('#cadastro-pessoal-ALUNO td'));
        return tds.map(td => td.textContent.trim());
    });
    const userDetails = { Nome: previousData.nome };
    data.forEach((info, i) => {
        if (i % 2 == 0)
            userDetails[info] = null;
        else
            userDetails[data[i - 1]] = info;
    })
    listData.push(userDetails);
    await browser.close();
    return listData;
}

const getPreviousData = async (elementList) => {
    const previousUserDataPromise = elementList.map(elem => {
        let term = elem || '';
        if (isNaN(parseFloat(elem))) {
            term = term.trim().replaceAll(' ', '+');
        }
        return axios.get(`${URL_BASE}/busca_cadastro.json?term=${term}`);
    });
    const previousResolvedPromises = await Promise.all(previousUserDataPromise);
    const previousList = previousResolvedPromises.map(res => PreviousUserData(res.data));
    return previousList;
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