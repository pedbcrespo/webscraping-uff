import * as puppeteer from 'puppeteer';
import axios from "axios";
import { generateJsonFile, generateWebscraping, parseArgs, readFileToList } from './utils.js';

const URL_BASE = 'https://app.uff.br/transparencia';

export const execute = async (list) => {
    if(!list || list.length === 0) return [];
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

const extractData = async (listData, previousData) => {
    const url = `${URL_BASE}/busca_cadastro_pessoa?cpf=${previousData.cpf}&ididentificacao=${previousData.identificacao}&tipo=`;
    // const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const browser = await puppeteer.launch(generateWebscraping());
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

const args = process.argv.slice(2);
const parsedArgs = parseArgs(args);

const flags = [
    {
        key: 'list',
        execute: async (parsedArgs) => {
            const stringList = parsedArgs.list.split(',').map(elem => elem.trim());
            return await execute(stringList);
        }
    },
    {
        key: 'file',
        execute: async (parsedArgs) => {
            const stringList = await readFileToList(parsedArgs.file);
            return await execute(stringList);
        }
    }
];

const keyList = Object.keys(parsedArgs);
const operationByFlag = keyList.length > 0 ? flags.find(flag => flag.key === keyList[0]): null;
if(operationByFlag)
    await operationByFlag.execute(parsedArgs);



    