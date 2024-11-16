import axios from "axios";
import * as cheerio from 'cheerio';

const URL_BASE = 'https://app.uff.br/transparencia/busca_cadastro';

const PreviousUserData = (resData) => {
    const {cpf, nome, identificacao} = resData[0].pessoa;
    return {cpf, nome, identificacao};
};

export const execute = async (cpfList) => {
    const previousUserDataPromise = cpfList.map(cpf => axios.get(`${URL_BASE}.json?term=${cpf}`));
    const previousResolvedPromises = await Promise.all(previousUserDataPromise);
    const previousList = previousResolvedPromises.map(res => PreviousUserData(res.data));
    console.log("PREVIOUS DATA");
    console.log(previousList);
    console.log("==================");
    for(const previousData of previousList) {
        const detailsUrl = `${URL_BASE}?cpf=${previousData.cpf}&ididentificacao=${previousData.identificacao}&tipo=`;
        const response  = await axios.get(detailsUrl);
        const html = cheerio.load(response.data);
        console.log("HTML");
        console.log(html);
        console.log("==================");
    }
}

execute(['14754473701']);