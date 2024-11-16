import axios from "axios";
import * as cheerio from 'cheerio';

const URL_BASE = 'https://app.uff.br/transparencia/busca_cadastro';

const PreviousUserData = (resData) => {
    const {cpf, nome, ididentificacao} = resData[0].pessoa;
    return {cpf, nome, identificacao: ididentificacao};
};

export const execute = async (cpfList) => {
    const previousList = await getPreviousData(cpfList);
    for(const previousData of previousList) {
        const { data } = await getDetailsData(previousData);
        console.log(data);
        // const html = cheerio.load(data);
        // console.log("LEU O HTML");
    }
}

const getDetailsData = async (previousData) => {
    const detailsUrl = `${URL_BASE}?cpf=${previousData.cpf}&ididentificacao=${previousData.identificacao}&tipo=`;
    console.log('url', detailsUrl);
    return await axios.get(detailsUrl);
}

const getPreviousData = async (cpfList) => {
    const previousUserDataPromise = cpfList.map(cpf => axios.get(`${URL_BASE}.json?term=${cpf}`));
    const previousResolvedPromises = await Promise.all(previousUserDataPromise);
    const previousList = previousResolvedPromises.map(res => PreviousUserData(res.data));
    console.log("PREVIOUS DATA");
    console.log(previousList);
    console.log("==================");
    return previousList;
}

execute(['14754473701']);