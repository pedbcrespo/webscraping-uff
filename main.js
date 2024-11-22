import { parseArgs, readFileToList } from "./utils.js";
import { execute } from "./webscraping.js";

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
    },
];

const keyList = Object.keys(parsedArgs);
const operationByFlag = keyList.length > 0 ? flags.find(flag => flag.key === keyList[0]): null;
if(operationByFlag)
    await operationByFlag.execute(parsedArgs);



    