# webscraping-uff

Webscraping para coletar dados do site da UFF.

Este projeto utiliza **Axios** para fazer as requisições e **Puppeteer** ou **Selenium** para automatizar o processo de navegação e coleta de dados.

## Como Usar

Basta importar a função `execute` do arquivo `main.js`, passando como parâmetro uma lista de CPFs. A função irá retornar os dados coletados do site da UFF relacionados aos CPFs fornecidos.

### Exemplo de Código

```javascript
import { execute } from './main.js';

const resultados = await execute(['12345678901', '11122233345', '33322211165']);

console.log(resultados); // Exibe os dados coletados
