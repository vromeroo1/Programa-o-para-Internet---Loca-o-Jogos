const bcrypt = require('bcryptjs');
const IService = require('../interfaces/IService');
const UsuarioDAO = require('../daos/UsuarioDAO');
const AppError = require('../utils/AppError');
const LogService = require('./LogService');

class UsuarioService extends IService {
  constructor(usuarioDAO = new UsuarioDAO(), logService = new LogService()) {
    super();
    this.usuarioDAO = usuarioDAO;
    this.logService = logService;
  }

  async listar(filtros) {
    return this.usuarioDAO.listar(filtros);
  }

  async buscarPorId(id) {
    const usuario = await this.usuarioDAO.buscarPorId(id);
    if (!usuario) throw new AppError('Usuario nao encontrado.', 404);
    return usuario;
  }

  async criar(dados, autor) {
    const existente = await this.usuarioDAO.buscarPorEmail(dados.email);
    if (existente) throw new AppError('Ja existe usuario com este email.', 409);

    const usuario = await this.usuarioDAO.criar({
      ...dados,
      senha: await bcrypt.hash(dados.senha, 10)
    });

    await this.logService.registrar({
      usuario: autor?.email || usuario.email,
      acao: 'CRIAR_USUARIO',
      detalhes: { tabela: 'usuarios', registro_id: usuario.id, dados_inseridos: usuario }
    });

    return usuario;
  }

  async atualizar(id, dados, autor) {
    const antes = await this.buscarPorId(id);
    const dadosAtualizados = { ...dados };

    if (dadosAtualizados.senha) {
      dadosAtualizados.senha = await bcrypt.hash(dadosAtualizados.senha, 10);
    }

    const usuario = await this.usuarioDAO.atualizar(id, dadosAtualizados);

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'ATUALIZAR_USUARIO',
      detalhes: { tabela: 'usuarios', registro_id: id, antes, depois: usuario }
    });

    return usuario;
  }

  async remover(id, autor) {
    const antes = await this.buscarPorId(id);
    const removido = await this.usuarioDAO.remover(id);

    await this.logService.registrar({
      usuario: autor?.email || 'sistema',
      acao: 'REMOVER_USUARIO',
      detalhes: { tabela: 'usuarios', registro_id: id, dados_excluidos: antes }
    });

    return removido;
  }
}

module.exports = UsuarioService;
