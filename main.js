import * as puppeteer from 'puppeteer';
import axios from "axios";

const URL_BASE = 'https://app.uff.br/transparencia';

export const execute = async (cpfList) => {
    let listData = [];
    const previousList = await getPreviousData(cpfList);
    if(previousList.some(data => !data)) {
        console.error("LISTA COM DADOS INVALIDOS", cpfList)
        return [];
    }
    for (const previousData of previousList) {
        try {
            listData = await extractData(listData, previousData);
        }
        catch(error) {
            console.error(error);
        }
    }
    return listData;
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
    const userDetails = {};
    data.forEach((info, i) => {
        if(i % 2 == 0)
            userDetails[info] = null;
        else
            userDetails[data[i-1]] = info;
    })
    listData.push(userDetails);
    await browser.close();
    return listData;
}

const getPreviousData = async (cpfList) => {
    const previousUserDataPromise = cpfList.map(cpf => axios.get(`${URL_BASE}/busca_cadastro.json?term=${cpf}`));
    const previousResolvedPromises = await Promise.all(previousUserDataPromise);
    const previousList = previousResolvedPromises.map(res => PreviousUserData(res.data));
    return previousList;
}

const PreviousUserData = (resData) => {
    if(!resData || resData.length === 0) return null;
    const { cpf, nome, ididentificacao } = resData[0].pessoa;
    return { cpf, nome, identificacao: ididentificacao };
};