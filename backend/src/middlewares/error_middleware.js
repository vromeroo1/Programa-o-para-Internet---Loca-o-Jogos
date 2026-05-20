const { erro: responderErro } = require('../utils/resposta');
const LogService = require('../services/LogService');

const logService = new LogService();

function errorMiddleware(err, req, res, next) {
  const status = err.statusCode || 500;
  const detalhes = err.detalhes || null;

  logService.registrar({
    usuario: req.usuario?.email || 'anonimo',
    endpoint: req.originalUrl,
    metodo: req.method,
    status_code: status,
    acao: 'ERRO',
    ip: req.ip,
    detalhes: {
      erro: err.message,
      stack_trace: process.env.NODE_ENV === 'production' ? undefined : err.stack
    }
  }).catch(() => {});

  return responderErro(res, err.message || 'Erro interno no servidor.', status, detalhes);
}

module.exports = errorMiddleware;
