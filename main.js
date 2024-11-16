import { Builder, Browser } from 'selenium-webdriver';

const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .build();

const execute = async (dataList) => {
    await driver.get('https://google.com');
}

execute([]);