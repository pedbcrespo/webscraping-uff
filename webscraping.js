import * as puppeteer from 'puppeteer';
import axios from "axios";
import { generateJsonFile, generateWebscraping, parseArgs, readFileToList } from './utils.js';

const URL_BASE = 'https://app.uff.br/transparencia';

export const execute = async (list, isSiape=false) => {
    if(!list || list.length === 0) return [];
    let listData = isSiape? await extractDataSiape(list) : await extractDataNameOrCpf(list);
    generateJsonFile(listData);
    return listData;
}

const extractDataSiape = async (listSiapeId) => {
    let listData = [];
    for(const siapeId of listSiapeId) {
        const url = `${URL_BASE}/busca_cadastro_por_siape?siape=${siapeId}&ididentificacao=`;
        const listUserDetails = await extractData(url, true);
        const mostCurrentData = handleExtractedData(listUserDetails, siapeId, true);
        listData.push(mostCurrentData);
    }
    return listData;
}

const extractDataNameOrCpf = async (listCpfOrName) => {
    let listData = [];
    const previousList = await getPreviousData(listCpfOrName);
    for (const previousData of previousList) {
        try {
            const url = `${URL_BASE}/busca_cadastro_pessoa?cpf=${previousData.cpf}&ididentificacao=${previousData.identificacao}&tipo=`;
            const listUserDetails = await extractData(url);
            const mostCurrentData = handleExtractedData(listUserDetails, previousData.nome);
            listData.push(mostCurrentData);
        }
        catch (error) {
            console.error(error);
        }
    }
    return listData;
}

const extractData = async (url, isSiape = false) => {
    const browser = await puppeteer.launch(generateWebscraping());
    const page = await browser.newPage();
    await page.goto(url);
    
    const listUserDetails = await page.evaluate((isSiape) => {
        const htmlTag = 'table#cadastro-pessoal-' + (isSiape ? 'DOCENTE' : 'ALUNO');
        const tables = document.querySelectorAll(htmlTag);
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
    }, isSiape);
    
    await browser.close();
    return listUserDetails;
}

const handleExtractedData = (listUserDetails, identification, isSiape) => {
    const key = isSiape? 'Situação' : 'Status';
    let userDetails = { 'Usuario:': identification };
    const mostCurrentData = listUserDetails.find((user, i) => {
        const isGraduated = user[key].toLowerCase().includes('formado');
        const isActived = user[key].toLowerCase().includes('ativo');
        return isGraduated || isActived;
    });
    return mostCurrentData? { ...userDetails, ...mostCurrentData } : { ...userDetails, ...listUserDetails[0]};
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