import { Builder, Browser, By } from 'selenium-webdriver';
import axios from 'axios';

const URL_BASE = 'https://app.uff.br/transparencia/busca_cadastro';

const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .build();


export const execute = async (cpfList) => {
    try {
        await driver.get(URL_BASE);
        for(const cpf of cpfList) {
            const inputElement = await driver.findElement(By.xpath('//*[@id="busca"]'));
            inputElement.sendKeys(cpf);
        }
    }
    catch {
        console.error(`ERRO AO ACESSAR A URL: '${URL_BASE}'`)
    }
}



const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


execute([]);

