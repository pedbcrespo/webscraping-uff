# webscraping-uff

Webscraping para coletar dados do site da UFF.

Este projeto utiliza **Axios** para fazer as requisições e **Puppeteer** para automatizar o processo de navegação e coleta de dados.

## Como Usar
Após clonar o repositorio, acessa-lo e executar:
```bash
npm install
```
Há duas formas de usar o projeto, implementando no arquivo main.js ou pelo terminal.

### Exemplo de Código
```javascript
// dentro do arquivo main.js
const listaNomesOuCpfs = ['Pedro de Barros Crespo', 'Savio Carvalho Moraes'];
const resultados = await execute(listaNomesOuCpfs);
console.log(resultados); // Exibe os dados coletados e cria um arquivo json
```

Caso não queira acessar o arquivo e implementar os comandos, como alternativa execute no terminal:
```bash
node main -list "Pedro de Barros Crespo"
```

lembrar de separar por virgula:
```bash
node main -list "Pedro de Barros Crespo, Fulano de Tal, Savio Carvalho Moraes"
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
node main -file "nomes.txt"
```

## IMPORTANTE:
Para buscar dados referentes á Professores e técnicos (servidores públicos), necessario usar flags especificas como no exemplo:
```bash
node main -siape "numero_do_siape1, numero_do_siape2"
```

```bash
node main -siapefile "siape_arquivo_texto.txt"
```


### Detalhe:
Se algum dos nomes estiver escrito errado, um log de erro sera apresentado durante a execução e o dado será descartado.

O codigo gera um arquivo json com os dados coletados.
