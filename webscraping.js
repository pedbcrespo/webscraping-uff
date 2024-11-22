import * as puppeteer from 'puppeteer';
import axios from "axios";
import { generateJsonFile, generateWebscraping, validateNormalData } from './utils.js';
import { getProgressBar, logger } from './logger.js';

const URL_BASE = 'https://app.uff.br/transparencia';

export const execute = async (list) => {
    if (!list || list.length === 0) {
        logger.warn('Nenhum dado fornecido.');
        return []
    };
    const normalList = [];
    const siapeList = [];
    logger.info(`Lendo ${list.length} dados...`);
    list.forEach(data => {
        const isNormalData = validateNormalData(data);
        if (isNormalData)
            normalList.push(data);
        else
            siapeList.push(data);
    })
    const listData = (await extractDataSiape(siapeList)).concat(await extractDataNameOrCpf(normalList));
    generateJsonFile(listData);
    return listData;
}

const extractDataSiape = async (listSiapeId) => {
    if (listSiapeId.length === 0) return [];
    let listData = [];
    logger.info(`Lendo Matriculas SIAPE`);
    const progressBar = getProgressBar();
    progressBar.start(listSiapeId.length, 0);
    let index = 0;
    for (const siapeId of listSiapeId) {
        try {
            const url = `${URL_BASE}/busca_cadastro_por_siape?siape=${siapeId}&ididentificacao=`;
            const listUserDetails = await extractData(url, true);
            const mostCurrentData = handleExtractedData(listUserDetails, siapeId);
            listData.push(mostCurrentData);
            index += 1;
            progressBar.update(index);
        }
        catch (error) {
            logger.error('Erro ao ler os dados' + error);
        }
    }
    progressBar.stop();
    return listData;
}

const extractDataNameOrCpf = async (listCpfOrName) => {
    if (listCpfOrName.length === 0) return [];
    let listData = [];

    logger.info(`Lendo Nomes e/ou Cpfs`);
    const progressBar = getProgressBar();
    progressBar.start(listCpfOrName.length, 0);
    let index = 0;

    const previousList = await getPreviousData(listCpfOrName);
    for (const previousData of previousList) {
        try {
            const url = `${URL_BASE}/busca_cadastro_pessoa?cpf=${previousData.cpf}&ididentificacao=${previousData.identificacao}&tipo=`;
            const listUserDetails = await extractData(url);
            const mostCurrentData = handleExtractedData(listUserDetails, previousData.nome);
            listData.push(mostCurrentData);
            index += 1;
            progressBar.update(index);
        }
        catch (error) {
            logger.error('Erro ao ler os dados' + error);
        }
    }
    progressBar.stop();
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
            logger.warn(`ELEMENTO '${elementList[i]}' NAO ENCONTRADO`);
        return data;
    });
    return previousList.filter(data => data);
}

const extractData = async (url) => {
    const browser = await puppeteer.launch(generateWebscraping());
    const page = await browser.newPage();
    await page.goto(url);

    const listUserDetails = await page.evaluate(() => {
        const userDetailsFromTables = []
        const tables = document.querySelectorAll('table[id^="cadastro-pessoal-"]');
        tables.forEach(table => {
            const { id } = table;
            const tableData = { tableId: id };
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row) => {
                const cells = row.querySelectorAll('td');
                const key = cells[0].textContent.trim();
                const value = cells[1].textContent.trim();
                tableData[key] = value;
            });
            userDetailsFromTables.push(tableData);
        });
        return userDetailsFromTables;
    });
    await browser.close();
    return listUserDetails;
};

const handleExtractedData = (listUserDetails, identification) => {
    let userDetails = { 'Usuario:': identification };
    const mostCurrentData = listUserDetails.find(user => {
        const splitedTableId = user.tableId.split('-');
        const typeTable = splitedTableId[splitedTableId.length - 1];
        const key = typeTable === 'DOCENTE' ? 'Situação' : 'Status';
        const isGraduated = user[key].toLowerCase().includes('formado');
        const isActived = user[key].toLowerCase().includes('ativo');
        return isGraduated || isActived;
    });
    return mostCurrentData ? { ...userDetails, ...mostCurrentData } : { ...userDetails, ...listUserDetails[0] };
}

const PreviousUserData = (resData) => {
    if (!resData || resData.length === 0) return null;
    const { cpf, nome, ididentificacao } = resData[0].pessoa;
    return { cpf, nome, identificacao: ididentificacao };
};