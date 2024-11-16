# webscraping-uff

Webscraping para coletar dados do site da UFF.

Este projeto utiliza **Axios** para fazer as requisições e **Puppeteer** para automatizar o processo de navegação e coleta de dados.

## Como Usar

Basta importar a função `execute` do arquivo `main.js`, passando como parâmetro uma lista de strings, podendo ser tanto uma lista de nomes quanto de CPFs. A função irá retornar os dados coletados do site da UFF relacionados aos CPFs fornecidos.

### Exemplo de Código

```javascript
import { execute } from './main.js';

const resultados = await execute(['Fulano de Tal', '11122233345']);

console.log(resultados); // Exibe os dados coletados
