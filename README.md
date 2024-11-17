# webscraping-uff

Webscraping para coletar dados do site da UFF.

Este projeto utiliza **Axios** para fazer as requisições e **Puppeteer** para automatizar o processo de navegação e coleta de dados.

## Como Usar

Basta importar a função `execute` do arquivo `main.js`, passando como parâmetro uma lista de strings, podendo ser tanto uma lista de nomes quanto de CPFs. A função irá retornar os dados coletados do site da UFF relacionados aos CPFs fornecidos.

### Exemplo de Código
```javascript
// dentro do arquivo main.js
const listaNomesOuCpfs = ['Pedro de Barros Crespo'];
const resultados = await execute(listaNomesOuCpfs);
console.log(resultados); // Exibe os dados coletados e cria um arquivo json
```

Caso não queira acessar o arquivo e implementar os comandos, como alternativa execute no terminal:
```bash
node main -list "Pedro de Barros Crespo"
```

lembrar de separar por virgula:
```bash
node main -list "Pedro de Barros Crespo, Fulano de Tal, Deutrano Não Sei das Quantas"
```

### Detalhe:
Se algum dos nomes estiver escrito errado, um erro pode ser gerado e toda a aplicação irá parar para evitar demais problemas.

O codigo gera um arquivo json com os dados coletados.
