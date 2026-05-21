# LocaGames Univap

Sistema web full stack para a disciplina **Programacao Para Internet**. O projeto usa **Node.js + Express** no backend, **HTML5 + CSS3 + JavaScript + Bootstrap** no frontend, **MySQL** como banco relacional e **MongoDB** para logs do sistema.

O XAMPP entra apenas como apoio para ligar o MySQL e visualizar o banco pelo phpMyAdmin. O Apache nao e necessario para rodar a aplicacao.

## Tecnologias

- Node.js e Express
- HTML5, CSS3, JavaScript e Bootstrap
- MySQL com prepared statements
- MongoDB para logs de auditoria
- JWT para autenticacao
- Multer para upload de imagens
- Chart.js no dashboard
- PDFKit para relatorios em PDF
- xml2js para exportacao XML

## Estrutura

```text
backend/
  src/
    config/
    controllers/
    daos/
    interfaces/
    middlewares/
    models/
    routes/
    services/
    utils/
  uploads/
database/
frontend/
  assets/
    css/
    js/
  pages/
docs/
```

A arquitetura foi organizada em MVC, Service Layer, Router, Middleware e DAO Pattern. As interfaces `IDAO`, `IService` e `IController` ficam em `backend/src/interfaces`.

## Como Rodar

1. Instale as dependencias:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
copy .env.example .env
```

3. No XAMPP, ligue o **MySQL**. Se preferir enxergar as tabelas pelo navegador, abra:

```text
http://localhost/phpmyadmin
```

4. Crie o banco executando o arquivo:

```text
database/banco.sql
```

5. Confira o `.env`. Se seu MySQL tiver senha, preencha `MYSQL_PASSWORD`.

6. Rode a aplicacao:

```bash
npm start
```

7. Acesse:

```text
http://localhost:3000
```

Usuarios de teste:

```text
Admin: admin@locadora.com / 123456
Usuario comum: usuario@locadora.com / 123456
```

## MongoDB

Se o MongoDB estiver rodando em `mongodb://127.0.0.1:27017`, os logs serao gravados na colecao `logs` do banco `locacao_jogos_logs`.

Para facilitar apresentacao em sala, o sistema tambem possui fallback local em `backend/logs/logs_fallback.jsonl` caso o MongoDB ainda nao esteja iniciado. Assim a API continua funcionando, mas o ideal para demonstrar o requisito e deixar o MongoDB ligado.

## Scripts

```bash
npm run dev
npm start
npm run verificar
npm run documentacao:pdf
```

## Funcionalidades

- Login e logout com JWT
- Rotas protegidas por middleware de autenticacao e permissao
- Interface diferente para admin e usuario comum
- CRUD de usuarios, categorias, jogos e emprestimos
- Catalogo do usuario com abas de videogames e board games
- Reservas solicitadas pelo usuario comum
- Upload de imagem dos jogos
- Criacao e devolucao de emprestimos
- Atualizacao automatica de estoque
- Calculo de multa por atraso
- Filtros por titulo, categoria, status, usuario e atrasados
- Dashboard com indicadores e grafico Chart.js
- Relatorios PDF de jogos e emprestimos
- Exportacao JSON
- Importacao JSON
- Exportacao XML dos logs
- Logs completos com usuario, endpoint, metodo, status, acao, IP e detalhes

## Endpoints Principais

Base da API:

```text
http://localhost:3000/api
```

Todas as rotas abaixo, exceto `/api/health` e `/api/auth/login`, exigem token JWT:

```text
Authorization: Bearer TOKEN_JWT
```

Rotas:

```text
POST   /auth/login
POST   /auth/logout
GET    /auth/me
GET    /usuarios
POST   /usuarios
PUT    /usuarios/:id
DELETE /usuarios/:id
GET    /categorias
POST   /categorias
PUT    /categorias/:id
DELETE /categorias/:id
GET    /jogos
POST   /jogos
PUT    /jogos/:id
DELETE /jogos/:id
GET    /emprestimos
POST   /emprestimos
PUT    /emprestimos/:id
POST   /emprestimos/:id/devolver
DELETE /emprestimos/:id
POST   /reservas
GET    /minhas-reservas
DELETE /minhas-reservas/:id
GET    /dashboard/resumo
GET    /exportacao/:entidade
POST   /importacao/:entidade
GET    /logs
GET    /logs/exportar/xml
GET    /relatorios/jogos/pdf
GET    /relatorios/emprestimos/pdf
```

Exemplo de login:

```json
{
  "email": "admin@locadora.com",
  "senha": "123456"
}
```

Exemplo de emprestimo:

```json
{
  "usuario_id": 2,
  "data_prevista_devolucao": "2026-05-30",
  "observacoes": "Retirada no balcao",
  "itens": [
    { "jogo_id": 1, "quantidade": 1 },
    { "jogo_id": 3, "quantidade": 1 }
  ]
}
```

Todas as respostas JSON seguem o formato:

```json
{
  "sucesso": true,
  "mensagem": "Operacao realizada com sucesso.",
  "dados": {}
}
```

## Banco de Dados

O script `database/banco.sql` cria as tabelas, chaves estrangeiras, indices e dados de teste. O arquivo `database/exemplos_consultas.sql` demonstra consultas com `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `WHERE`, operadores logicos, filtros e `JOIN`.

O arquivo `database/inserts_jogos_completo.sql` contem uma carga separada com 120 jogos reais para popular novamente a tabela `jogos`.

Relacionamentos:

- `usuarios` 1:N `emprestimos`
- `categorias` 1:N `jogos`
- `emprestimos` N:N `jogos` por `itens_emprestimo`
