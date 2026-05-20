const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`Servidor da Locacao de Jogos rodando em http://localhost:${env.port}`);
});
