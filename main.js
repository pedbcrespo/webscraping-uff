import axios from "axios";
import * as cheerio from 'cheerio';

const URL_BASE = 'https://app.uff.br/transparencia/busca_cadastro';

const PreviousUserData = (resData) => {
    const {cpf, nome, ididentificacao} = resData[0].pessoa;
    return {cpf, nome, identificacao: ididentificacao};
};

export const execute = async (cpfList) => {
    let listData = [];
    const previousList = await getPreviousData(cpfList);
    for(const previousData of previousList) {
        const { data } = await getDetailsData(previousData);
        listData = extractData(listData, data);
    }
    return listData
}

const extractData = (listData, data) => {
    const html = cheerio.load(data);
    console.log("LEU O HTML");
    return listData;
}

const getDetailsData = async (previousData) => {
    const detailsUrl = `https://app.uff.br/transparencia/busca_cadastro_pessoa?cpf=${previousData.cpf}&ididentificacao=${previousData.identificacao}&tipo=`;
    const response = await axios.get(detailsUrl);
    console.log(response);
    return response;
}

const getPreviousData = async (cpfList) => {
    const previousUserDataPromise = cpfList.map(cpf => axios.get(`${URL_BASE}.json?term=${cpf}`));
    const previousResolvedPromises = await Promise.all(previousUserDataPromise);
    const previousList = previousResolvedPromises.map(res => PreviousUserData(res.data));
    return previousList;
}



execute(['14754473701']);