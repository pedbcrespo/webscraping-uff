import * as os from 'os';
import * as fs from 'fs';
import * as fsAsync from 'fs/promises';

const OPERATIONA_SYSTEM = {
    win32: 'Windows',
    darwin: 'MacOS',
    linux: 'Linux',
    aix: 'AIX',
    freebsd: 'FreeBSD',
    openbsd: 'OpenBSD',
    sunos: 'SunOS',
}


export const generateWebscraping = () => {
    // const params = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    const params = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    if(detectOperatingSystem() === OPERATIONA_SYSTEM.darwin){
        params['executablePath'] = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    }
    return params;
}

export const readFileToList = async (filePath) => {
    try {
        const fileContent = await fsAsync.readFile(filePath, 'utf-8');
        const list = fileContent.split(/[\n,]/).map(line => line.trim()).filter(line => line);
        return list;
    } catch (error) {
        console.error(`Erro ao ler o arquivo: ${error.message}`);
        return [];
    }
};

export const parseArgs = (args) => {
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

export const generateJsonFile = (listData) => {
    const jsonData = JSON.stringify(listData, null, 2);
    fs.writeFile('usuarios-uff.json', jsonData, (err) => {
        if (err) {
            console.error("Erro ao criar o arquivo:", err);
        } else {
            console.log("Arquivo JSON criado com sucesso!");
        }
    });
}


const detectOperatingSystem = () => {
    const platform = os.platform();
    const currentOperationalSystem = OPERATIONA_SYSTEM[platform];
    return currentOperationalSystem || 'Unknown';
}