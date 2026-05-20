const express = require('express');
const CategoriaController = require('../controllers/CategoriaController');
const authMiddleware = require('../middlewares/auth_middleware');
const { validarCorpo, schemas } = require('../middlewares/validation_middleware');
const asyncHandler = require('../utils/asyncHandler');

class CategoriaRouter {
  constructor(controller = new CategoriaController()) {
    this.router = express.Router();
    this.controller = controller;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(authMiddleware);
    this.router.get('/', asyncHandler(this.controller.listar.bind(this.controller)));
    this.router.get('/:id', asyncHandler(this.controller.buscarPorId.bind(this.controller)));
    this.router.post('/', validarCorpo(schemas.categoria), asyncHandler(this.controller.criar.bind(this.controller)));
    this.router.put('/:id', validarCorpo(schemas.categoria), asyncHandler(this.controller.atualizar.bind(this.controller)));
    this.router.delete('/:id', asyncHandler(this.controller.remover.bind(this.controller)));
  }

  getRouter() {
    return this.router;
  }
}

module.exports = CategoriaRouter;
