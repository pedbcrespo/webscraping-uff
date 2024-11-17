# webscraping-uff

Webscraping para coletar dados do site da UFF.

Este projeto utiliza **Axios** para fazer as requisições e **Puppeteer** para automatizar o processo de navegação e coleta de dados.

## Como Usar
Há duas formas de usar o projeto, implementando no arquivo main.js ou pelo terminal.

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
Se algum dos nomes estiver escrito errado, um log de erro sera apresentado durante a execução e o dado será descartado.

O codigo gera um arquivo json com os dados coletados.
