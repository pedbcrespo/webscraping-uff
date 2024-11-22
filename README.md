# webscraping-uff

Webscraping para coletar dados do site da UFF.

Este projeto utiliza **Axios** para fazer as requisições e **Puppeteer** para automatizar o processo de navegação e coleta de dados.

## Como Usar
Após clonar o repositorio, acessa-lo e executar:
```bash
npm install
```
Há duas formas de usar o projeto, implementando no arquivo main.js ou pelo terminal.
Os parametros de busca podem ser: Nome, Cpf e Matricula SIAPE.

### Exemplo de Código
```javascript
// dentro do arquivo main.js
const listaNomesCpfOuMatriculaSiape = ['Pedro de Barros Crespo', 'Savio Carvalho Moraes'];
const resultados = await execute(listaNomesCpfOuMatriculaSiape);
console.log(resultados); // Exibe os dados coletados e cria um arquivo json
```

Caso não queira acessar o arquivo e implementar os comandos, como alternativa execute no terminal:
```bash
npm start -- -list "Pedro de Barros Crespo"
```

lembrar de separar por virgula:
```bash
npm start -- -list "Pedro de Barros Crespo, Fulano de Tal, Savio Carvalho Moraes"
```

Outra alternativa pelo terminal é passar um arquivo texto:

* Exemplo de arquivo texto 1 (nomes.txt):
```text
Pedro de Barros Crespo, Fulano de Tal, Savio Carvalho Moraes
```

* Exemplo de arquivo texto 2 (nomes.txt):
```text
Pedro de Barros Crespo
Fulano de Tal
Savio Carvalho Moraes
```

para executar, use o comando seguindo o exemplo:
```bash
npm start -- -file "nomes.txt"
```

### Detalhe:
Se algum dos nomes estiver escrito errado, um log de erro sera apresentado durante a execução e o dado será descartado.

O codigo gera um arquivo json com os dados coletados.
