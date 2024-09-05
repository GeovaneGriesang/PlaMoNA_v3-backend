/* 
*  API PlaMoNA V2.0
*  Acesse https://plamona.onrender.com/ para ter acesso a documentação da API
*  @jgdalmeida
*/

const mysql = require('mysql');

// criando conexão com o banco
const connection = mysql.createConnection({
  // "process.env.VARIÁVEL" busca do arquivo .env as variáveis secretas, as quais não estão no repositório 
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "geovaneg_plamona",
});

connection.connect((error) => {
  if (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } else {
    console.log('Conexão bem-sucedida com o banco de dados.');
  }
});

module.exports = connection;