/* 
*  API PlaMoNA V2.0
*  Acesse https://plamona.onrender.com/ para ter acesso a documentação da API
*  @jgdalmeida
*/


const express = require('express');
const app = express();
const connection = require('./database');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const { rejects } = require('assert');
const { log, error } = require('console');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var emailAlvo;
var codigoVar;

app.use(cors({
  origin: '*'
}));

//Rota da documentação
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'documentation.html');
  // Envie o arquivo HTML como resposta
  res.sendFile(filePath);
});

//Rota das medicoes atuais
app.post('/medicoes', (req, res) => {

  // fazendo a requisição do período
  const periodo = req.body.periodo;
  let query = '';
  let id = '';

  // Testando os períodos

  // Período semana
  if (periodo === 'semana') {

    // query pro banco de dados
    query = 'SELECT AVG(nivel) as nivel, data FROM medicoes WHERE YEARWEEK(data) = YEARWEEK(NOW()) GROUP BY data';
    // id que será enviado no json
    id ='Semana Atual';

    //fazendo consulta no banco
    connection.query(query, (error, results) => {
      // Testando erros
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        // retornando erro
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        // formatando dados para o gráfico
        const dado = results.map(result => {
          const { nivel, data } = result;
          // formatando data para deixar legível
          const formattedDate = new Date(data).toLocaleString('pt-BR', { weekday: 'short' });

          // retornando dados para o gráfico
          return { "x": formattedDate, "y": nivel };
        });
  
        // json pronto para mandar para o gráfico
        const chartData = [{
          "id": id,
          "color": "#3633f9",
          "data": dado
        }];
  
        
         console.log(chartData); // Exibir o objeto do gráfico no console
        // enviando resposta
        res.status(200).json(chartData);
      }
    });
  } 
  
  // Período da semana anterior
  else if (periodo === 'semanaAnterior') {

    // query do banco de dados
    query = 'SELECT AVG(nivel) as nivel, data FROM medicoes WHERE YEARWEEK(data) = YEARWEEK(DATE_SUB(NOW(), INTERVAL 1 WEEK)) GROUP BY data';
    // Id para ser mostrado no gráfico
    id ='Semana Anterior';

    // fazendo consulta no banco 
    connection.query(query, (error, results) => {
      //testando erro
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } 
      // formatando dados para o gráfico
      else {
        const dado = results.map(result => {
          const { nivel, data } = result;
          const formattedDate = new Date(data).toLocaleString('pt-BR', { weekday: 'short' });
          return { "x": formattedDate, "y": nivel };
        });
  
        const chartData = [{
          "id": id,
          "color": "hsl(500, 50%, 50%)",
          "data": dado
        }];
  
        // console.log(chartData); // Exibir o objeto do gráfico no console

        // retornando resultados
        res.status(200).json(chartData);
      }
    });  
  } 

  // período dia
  else if (periodo==='dia') {
    // query para o banco de dados
    query = 'SELECT nivel, DATE_FORMAT(hora, "%H:%i") as hora FROM medicoes WHERE data = CURDATE()';

    // fazendo requisição ao banco
    connection.query(query, (error, results) => {
      //testando erro
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      }
      // formatando dados e mandando para os gráficos
      else {
        const data = results.map(result => {
          const { nivel, hora } = result;
          return { x: hora, y: nivel };
        });

        const chartData = [{
          id: "Dia",
          color: "hsl(200, 50%, 50%)",
          data: data
        }];

        // console.log(chartData); // Exibir o objeto do gráfico no console
        
        // enviando resposta da api
        res.status(200).json(chartData);
      }
    });
  } else { // enviando erro de período inválido
    console.log("Erro na função medições: Período inválido");
    res.status(400).json({ error: 'Período inválido.' });
    return;
  }  
});

//Rota para comparar medicoes
app.post('/comparacao', (req, res) => {
  
  const periodo = req.body.periodo;
  const comp1 = req.body.comp_1;
  const comp2 = req.body.comp_2;

  console.log("periodo:" + periodo);
  let id1 = `${new Date(comp1).toLocaleString({ day: 'numeric',month: 'short', year: 'numeric' })}`;
  let id2 = `${new Date(comp2).toLocaleString({ day: 'numeric',month: 'short', year: 'numeric' })}`;

  const novaData1 = transformarData(id1);
  const novaData2 = transformarData(id2);

  console.log("data 1 : "+novaData1);
  console.log("data 1 : "+novaData2);
  //id1 = "03 de jun. de 2024";
  let dado1 = '';
  let dado2 = '';
  let query1 = '';
  let query2 = '';
  if (periodo === 'semana') {
    query1 = `SELECT AVG(nivel) as nivel, data FROM medicoes WHERE YEARWEEK(data) = YEARWEEK('${novaData1}') GROUP BY data`;
    query2 = `SELECT AVG(nivel) as nivel, data FROM medicoes WHERE YEARWEEK(data) = YEARWEEK('${novaData2}') GROUP BY data`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, data } = result;
          const formattedDate = new Date(data).toLocaleString('pt-BR', { weekday: 'short' });
          return { x: formattedDate, y: nivel };
        });
  
        connection.query(query2, (error, results) => {
          if (error) {
            console.error('Erro ao obter dados do banco de dados:', error);
            res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
          } else {
            dado2 = results.map(result => {
              const { nivel, data } = result;
              const formattedDate = new Date(data).toLocaleString('pt-BR', { weekday: 'short' });
              return { x: formattedDate, y: nivel };
            });
            console.log("dado 2:"+dado1);
            const chartData = [
              {
                id: id1,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
              {
                id: id2,
                color: 'hsl(300, 50%, 50%)',
                data: dado2,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
          }
        });
      }
    });
  } else if (periodo === 'mes') {
    query1 = `SELECT nivel, data FROM medicoes WHERE DATE_FORMAT(data, '%Y-%m') = DATE_FORMAT('${novaData1}', '%Y-%m') AND HOUR(hora) = 14`;
    query2 = `SELECT nivel, data FROM medicoes WHERE DATE_FORMAT(data, '%Y-%m') = DATE_FORMAT('${novaData2}', '%Y-%m') AND HOUR(hora) = 14`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, data } = result;
          const formattedDate = new Date(data).toLocaleDateString('pt-BR',{ day: '2-digit'});
          return { "x": formattedDate, "y": nivel };
        });
  
        connection.query(query2, (error, results) => {
          if (error) {
            console.error('Erro ao obter dados do banco de dados:', error);
            res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
          } else {
            dado2 = results.map(result => {
              const { nivel, data } = result;
              const formattedDate = new Date(data).toLocaleString('pt-BR', { day: '2-digit' });
              return { x: formattedDate, y: nivel };
            });
  
            const chartData = [
              {
                id: `${new Date(comp1).toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}`,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
              {
                id: `${new Date(comp2).toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}`,
                color: 'hsl(300, 50%, 50%)',
                data: dado2,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
          }
        });
      }
    });
  } else if (periodo === 'ano') {
    console.log(comp1);
    query1 = `SELECT 
    CASE m.mes
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Fev'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Abr'
      WHEN 5 THEN 'Mai'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Ago'
      WHEN 9 THEN 'Set'
      WHEN 10 THEN 'Out'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dez'
    END as mes,
    CASE WHEN n.nivel IS NOT NULL THEN ROUND(n.nivel, 2) ELSE 'null' END as nivel
  FROM (
    SELECT 1 as mes UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
  ) as m
  LEFT JOIN (
    SELECT MONTH(data) as mes, AVG(nivel) as nivel
    FROM medicoes
    WHERE YEAR(data) = YEAR('${novaData1}')
    GROUP BY mes
  ) as n ON m.mes = n.mes
  GROUP BY m.mes
  ORDER BY m.mes;`;
    query2 = `SELECT 
    CASE m.mes
      WHEN 1 THEN 'Jan'
      WHEN 2 THEN 'Fev'
      WHEN 3 THEN 'Mar'
      WHEN 4 THEN 'Abr'
      WHEN 5 THEN 'Mai'
      WHEN 6 THEN 'Jun'
      WHEN 7 THEN 'Jul'
      WHEN 8 THEN 'Ago'
      WHEN 9 THEN 'Set'
      WHEN 10 THEN 'Out'
      WHEN 11 THEN 'Nov'
      WHEN 12 THEN 'Dez'
    END as mes,
    CASE WHEN n.nivel IS NOT NULL THEN ROUND(n.nivel, 2) ELSE 'null' END as nivel
  FROM (
    SELECT 1 as mes UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
  ) as m
  LEFT JOIN (
    SELECT MONTH(data) as mes, AVG(nivel) as nivel
    FROM medicoes
    WHERE YEAR(data) = YEAR('${novaData2}')
    GROUP BY mes
  ) as n ON m.mes = n.mes
  GROUP BY m.mes
  ORDER BY m.mes;`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, mes } = result;
          return { "x": mes, "y": nivel };
        });
  
        connection.query(query2, (error, results) => {
          if (error) {
            console.error('Erro ao obter dados do banco de dados:', error);
            res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
          } else {
            dado2 = results.map(result => {
              const { nivel, mes } = result;
              return { x: mes, y: nivel };
            });
  
            const chartData = [
              {
                id: `${new Date(comp1).toLocaleString('pt-BR', { year: 'numeric' })}`,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
              {
                id: `${new Date(comp2).toLocaleString('pt-BR', { year: 'numeric' })}`,
                color: 'hsl(300, 50%, 50%)',
                data: dado2,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
          }
        });
      }
    });
  } else if (periodo === 'dia'){

    query1 = `SELECT nivel, DATE_FORMAT(hora, "%H:%i") as hora FROM medicoes WHERE data = DATE('${novaData1}')`;
    query2 = `SELECT nivel, DATE_FORMAT(hora, "%H:%i") as hora FROM medicoes WHERE data = DATE('${novaData2}')`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, hora } = result;
          return { "x": hora, "y": nivel };
        });
  
        connection.query(query2, (error, results) => {
          if (error) {
            console.error('Erro ao obter dados do banco de dados:', error);
            res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
          } else {
            dado2 = results.map(result => {
              const { nivel, hora } = result;
              return { x: hora, y: nivel };
            });
  
            const chartData = [
              {
                id: id1,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
              {
                id: id2,
                color: 'hsl(300, 50%, 50%)',
                data: dado2,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
          }
        });
      }
    });
  } else if (periodo === 'diaEsp'){

    query1 = `SELECT nivel, DATE_FORMAT(hora, "%H:%i") as hora FROM medicoes WHERE data = '${comp1}'`;
    connection.query(query1, (error, results) => {
      if (error) {
        console.error('Erro ao obter dados do banco de dados:', error);
        res.status(500).json({ error: 'Erro ao obter dados do banco de dados.' });
      } else {
        dado1 = results.map(result => {
          const { nivel, hora } = result;
          return { "x": hora, "y": nivel };
        });
            const chartData = [
              {
                id: id1,
                color: 'hsl(500, 50%, 50%)',
                data: dado1,
              },
            ];
  
            console.log(chartData);
            res.status(200).json(chartData);
      }
    });
  }else {
    console.log("periodo enviado inválido");
    res.status(400).json({ error: 'Período inválido' });
    return;
  }
});

//Rota para registro de usuário
app.post('/api/register', (req, res) => {
  const { nome, cpf, endereco, email, telefone,  alerta_sms, alerta_email, senha } = req.body;
  
  let query = "SELECT * FROM usuario WHERE email = ?;";

  connection.query(query, [email], (err, result) => {
    if (err) {
      console.error('Erro ao consultar usuário:', err);
      res.status(500).json({ message: 'Erro ao consultar usuario.', loginState: -1  });
    } else if (result.length > 0) {
      res.status(200).json({message: 'Usúario já cadastrado no banco de dados', loginState: 5});
    }else{
      console.log("não cadastrado")
      const sql = 'INSERT INTO usuario (nome, cpf, endereco, email, telefone, alerta_sms, alerta_email, senha, sensor_id_sensor, acesso ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)';
      const values = [nome, cpf, endereco, email, telefone, alerta_sms, alerta_email, senha];

      connection.query(sql, values, (err, result) => {
        if (err) {
          console.error('Erro ao criar usuário:', err);
          res.status(500).json({ message: 'Erro ao criar usuário.', loginState: 0 });
        } else {
          res.json({ message: 'Usuário registrado com sucesso!', loginState: 1 });
        }
      });
    }
  });


  
});

//Rota para verificação de login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const mail = email;
  const password = senha;

  let query = "SELECT * FROM usuario WHERE email = ?;";

  connection.query(query, [mail], (err, result) => {
    if (err) {
      console.error('Erro ao consultar usuário:', err);
      res.status(500).json({ message: 'Erro ao consultar usuario.', loginState: 0  });
    } else if (result.length > 0) {
      let querySenha = "SELECT * FROM usuario WHERE email = ? AND senha = ?;";

      connection.query(querySenha, [mail, password], (err, result) => {
        if (err) {
          console.error('Erro ao consultar usuário:', err);
          res.status(500).json({ message: 'Erro ao consultar usuario.', loginState: 0 });
        } else if (result.length > 0) {
          console.log(result[0].nome);
          res.status(200).json({ message: 'Usuário logado com sucesso!', loginState: 1, usuario: result[0]});
        } else {
          res.status(200).json({ message: 'Senha Incorreta', loginState: 2 });
        }
      });
    } else {
      res.json({ message: 'usuário inexistente', loginState: 0 });
    }
  });
});

 app.listen(4000, () => {
   console.log('Servidor iniciado na porta 4000.');
 });

 function sendEmail(){
  return new Promise((resolve, reject) =>{
    var tranporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
          user: 'contato.plamona@gmail.com',
          pass: 'bwbwbdqcuhsijein'
      }
    });
    console.log(emailAlvo);
    const mail_configs = {
      from:'contato.plamona@gmail.com',
      to: emailAlvo,
      subject: 'Email para recuperação de senha',
      html: `<!DOCTYPE html>
      <html lang="en" >
      <head>
        <meta charset="UTF-8">
        
      
      </head>
      <body>
      <!-- partial:index.partial.html -->
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
          </div>
          <p style="font-size:1.1em">Olá</p>
          <p>Foi solicitado a recuperação da senha, esse código válido por 5 minutos</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${codigoVar}</h2>
          <p style="font-size:0.9em;">PlaMoNa</p>
          <hr style="border:none;border-top:1px solid #eee" />
        </div>
      </div>
      <!-- partial -->
        
      </body>
      </html>`,
    }

    tranporter.sendMail(mail_configs, function(error, res){
      if(error){
        console.log(error);
        return reject({message: 'Occorreu um erro ao enviar o e-mail'});
      }
    return resolve({message: "Email enviado"})
    });
  });
}


app.post('/email', (req, res) => {
  const {email} = req.body;
  const mail = email;
  emailAlvo = email
  console.log("\nEmail enviado: "+ mail +"\n"+emailAlvo);

  let query = "SELECT * FROM usuario WHERE email = ?;";

  connection.query(query, [mail], (err, result) => {
    if (err) {
      console.error('Erro ao consultar usuário:', err);
      res.status(500).json({ message: 'Erro ao consultar usuario.', state: -1  });
    }else if(result.length > 0){
      codigoVar = Math.floor(Math.random() * 9000+1000);
      
      query = "INSERT INTO recuperacao(user, chave) VALUES (?, ?)";
      
      connection.query(query, [mail, codigoVar], (error, resultado) =>{
        if(err){
          console.error('Erro ao criar o código', err);
          res.status(500).json({message: 'Erro ao criar o código', state: -1  });
        }else{
          apagaCodigo();
          sendEmail()
          .then(res.json({message: 'E-mail enviado com sucesso', state: 1}))
          .catch(error => console.error(error.message));
        }
      });


      
    }else{
      res.status(200).json({message: 'Usuario não existe', state:-1});
    }
  });
});

function apagaCodigo(){
  const cod = codigoVar;
  console.log("Apagando chave "+cod+" em 5 min");
  setTimeout(function() {
    let query = "delete from recuperacao where chave=?";
    connection.query(query, [cod], (err, result) => {
      if(err){
        console.error("Erro ao apagar a chave em 5min");
      }else{
        console.log(cod+" apagado com sucesso");
      }
    });
    
  }, 300000);
}
app.post('/novaSenha', (req, res) => {
  const {codigo, novaSenha} = req.body;
  const cod = codigo;
  const senha = novaSenha;
  let query = "select user from recuperacao where chave = ?";

  connection.query(query, [cod], (err, result) => {
    if (err) {
      console.error('Erro ao consultar usuário:', err);
      res.status(500).json({ message: 'Erro ao consultar usuario.', state: -1  });
    }else if(result.length > 0){
      query = "update usuario inner join recuperacao ON recuperacao.user = usuario.email SET senha=? WHERE chave=?;";
      connection.query(query, [senha, cod], (err, resultado) =>{
        if(err){
          console.error('Erro ao trocar a senha', err);
          res.status(500).json({ message: 'Erro ao trocar a senha', state: -1  });
        }else{
          res.status(200).json({message: 'Senha alterada com sucesso', state: 0});
        }
      });
    }else{
      res.status(200).json({ message: 'Codigo incorreto ou expirado', state: -1  });
    }
  });
});


app.post('/getSensores', (req, res) =>{
  const idSensor = req.body;
  let query = "SELECT descricao_conf, nivelMin, alertarMin, msgMin,  nivelMax, alertarMax, msgMax "+
  "FROM conf_sensor "+
  "WHERE idSensor=?";
  connection.query(query, [idSensor], (err, result) => {
     if(err){
      console.error('Erro ao consultar os sensores', err);
      res.status(500).json({ message: 'Erro ao consultar os sensores', state: -1  });
     }else{
      console.log(result);
      res.status(200).json({message: 'Consulta aos sensores realizada com sucesso', state: 0, resultado: result});
     }
  });
});

app.post('/atualizaSensor', (req, res) => {
  const {idSensor, descricao, nvlMin, nvlMax, envMin, envMax, msgMin, msgMax} = req.body;
  const idSen = idSensor;
  const descr =  descricao;
  const nivelMin = nvlMin;
  const nivelMax = nvlMax;
  const enviarMin = envMin;
  const enviarMax = envMax;
  const mensagemMin = msgMin; 
  const mensagemMax = msgMax;

  let query = "SELECT id FROM conf_sensor WHERE idSensor=?";


  connection.query(query, [idSen], (err, result) => {
    if (err) {
      console.error('Erro ao consultar as configurações do sensor:', err);
      res.status(500).json({ message: 'Erro ao as configurações do sensor', state: -1  });
    }else{
      if(result.length>0){
        query = "UPDATE conf_sensor SET descricao_conf = ?, nivelMin = ?, alertarMin = ?, msgMin = ?, nivelMax = ?, alertarMax = ?, msgMax = ?"+
        "WHERE idSensor = ?";
        connection.query(query, [descr, nivelMin, enviarMin, mensagemMin, nivelMax, enviarMax, mensagemMax, idSen], (err, result) => {
            if(err){
              console.error('Erro ao atualizar as configurações do sensor:', err);
              res.status(500).json({ message: 'Erro ao atualizar as configurações do sensor', state: -1});
            }else{
              res.status(200).json({message: 'Configurações de sensor atualizadas com sucesso', state: 0});
            }
        });
      }else{
        query = "INSERT INTO conf_sensor(idSensor, descricao_conf, nivelMin, alertarMin, msgMin, nivelMax, alertarMax, msgMax) "+
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
        connection.query(query, [idSen, descr, nivelMin, enviarMin, mensagemMin, nivelMax, enviarMax, mensagemMax], (err, result) => {
            if(err){
              console.error('Erro ao criar as configurações do sensor:', err);
              res.status(500).json({ message: 'Erro ao criar as configurações do sensor', state: -1});
            }else{
              res.status(200).json({message: 'Configurações de sensor criados com sucesso', state: 0});
            }
        });
      }
    }
  });
});

//converte a data tanto do datePicker para uma forma em que o mysql consiga entender como data
function transformarData(data, tipo){
  
    let dataIsolada = data.split(',');

    let dataSeparada = dataIsolada[0].split('/');
    
    const novaData = dataSeparada[2]+"/"+dataSeparada[1]+"/"+dataSeparada[0];
    console.log("nova data: "+novaData);
    return novaData;
  
}