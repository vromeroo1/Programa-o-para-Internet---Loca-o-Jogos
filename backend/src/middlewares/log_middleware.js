const LogService = require('../services/LogService');

const logService = new LogService();

function logMiddleware(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    logService.registrar({
      usuario: req.usuario?.email || 'anonimo',
      endpoint: req.originalUrl,
      metodo: req.method,
      status_code: res.statusCode,
      acao: 'ACESSO_ROTA',
      ip: req.ip,
      detalhes: {
        tempo_resposta_ms: Date.now() - inicio,
        user_agent: req.headers['user-agent']
      }
    }).catch(() => {});
  });

  return next();
}

module.exports = logMiddleware;
