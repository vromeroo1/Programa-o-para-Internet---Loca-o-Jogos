const express = require('express');
const JogoController = require('../controllers/JogoController');
const authMiddleware = require('../middlewares/auth_middleware');
const { uploadImagem } = require('../middlewares/upload_middleware');
const { validarCorpo, schemas } = require('../middlewares/validation_middleware');
const asyncHandler = require('../utils/asyncHandler');

class JogoRouter {
  constructor(controller = new JogoController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.get('/', asyncHandler(this.controller.listar.bind(this.controller)));
    this.router.get('/:id', asyncHandler(this.controller.buscarPorId.bind(this.controller)));
    this.router.post(
      '/',
      uploadImagem.single('imagem'),
      validarCorpo(schemas.jogo),
      asyncHandler(this.controller.criar.bind(this.controller))
    );
    this.router.put(
      '/:id',
      uploadImagem.single('imagem'),
      validarCorpo(schemas.jogoAtualizacao),
      asyncHandler(this.controller.atualizar.bind(this.controller))
    );
    this.router.delete('/:id', asyncHandler(this.controller.remover.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = JogoRouter;
