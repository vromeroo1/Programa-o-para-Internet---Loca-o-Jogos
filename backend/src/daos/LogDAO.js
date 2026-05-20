const { ObjectId } = require('mongodb');
const { obterColecao } = require('../config/mongodb');
const IDAO = require('../interfaces/IDAO');

class LogDAO extends IDAO {
  async listar(filtros = {}) {
    const colecao = await obterColecao('logs');
    const query = {};

    if (filtros.usuario) {
      query.usuario = { $regex: filtros.usuario, $options: 'i' };
    }

    if (filtros.acao) {
      query.acao = filtros.acao;
    }

    if (filtros.data_inicio || filtros.data_fim) {
      query.timestamp = {};

      if (filtros.data_inicio) {
        query.timestamp.$gte = new Date(`${filtros.data_inicio}T00:00:00`);
      }

      if (filtros.data_fim) {
        query.timestamp.$lte = new Date(`${filtros.data_fim}T23:59:59`);
      }
    }

    return colecao.find(query).sort({ timestamp: -1 }).limit(300).toArray();
  }

  async buscarPorId(id) {
    const colecao = await obterColecao('logs');
    return colecao.findOne({ _id: new ObjectId(id) });
  }

  async criar(log) {
    const colecao = await obterColecao('logs');
    const documento = {
      ...log,
      timestamp: log.timestamp ? new Date(log.timestamp) : new Date()
    };
    const resultado = await colecao.insertOne(documento);
    return { _id: resultado.insertedId, ...documento };
  }

  async atualizar() {
    throw new Error('Logs nao sao atualizados para preservar auditoria.');
  }

  async remover() {
    throw new Error('Logs nao sao removidos pelo sistema.');
  }
}

module.exports = LogDAO;
