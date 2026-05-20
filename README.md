# LocaJogos Univap

Sistema Web Full Stack de Locadora de Jogos, desenvolvido para a disciplina Programacao Para Internet.

O projeto segue os requisitos do enunciado: Node.js, Express, HTML5, CSS3, JavaScript, Bootstrap, MySQL, MongoDB, JWT, Chart.js, Multer, PDFKit, xml2js, MVC, Service Layer, Router, Middleware, DAO Pattern e interfaces didaticas.

## Funcionalidades

- Login/logout com JWT.
- Rotas protegidas por middleware de autenticacao.
- CRUD de usuarios, categorias, jogos e emprestimos.
- Upload de imagem dos jogos com Multer.
- Controle de estoque na criacao e devolucao de emprestimos.
- Calculo de multa por atraso.
- Filtros por busca, categoria, status, usuario e atrasos.
- Dashboard com Chart.js.
- Relatorios PDF de jogos e emprestimos.
- Exportacao JSON.
- Importacao JSON via formulario.
- Logs completos no MongoDB.
- Exportacao XML dos logs.
- Respostas JSON padronizadas.

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
frontend/
  assets/
  pages/
database/
docs/
```

## Como executar

1. Instale as dependencias:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
copy .env.example .env
```

3. Crie o banco MySQL usando o script:

```bash
mysql -u root -p < database/banco.sql
```

4. Garanta que o MongoDB esteja rodando localmente:

```bash
mongod
```

5. Inicie a aplicacao:

```bash
npm start
```

6. Acesse:

```text
http://localhost:3000
```

Usuario de teste:

```text
Email: admin@locajogos.com
Senha: 123456
```

## Scripts

```bash
npm run dev
npm start
npm run verificar
npm run documentacao:pdf
```

## Endpoints principais

Todas as rotas abaixo, exceto `/api/health` e `/api/auth/login`, exigem header:

```text
Authorization: Bearer TOKEN_JWT
```

### Autenticacao

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Exemplo:

```json
{
  "email": "admin@locajogos.com",
  "senha": "123456"
}
```

### Usuarios

- `GET /api/usuarios?busca=&tipo_usuario=`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PUT /api/usuarios/:id`
- `DELETE /api/usuarios/:id`

### Categorias

- `GET /api/categorias?busca=`
- `GET /api/categorias/:id`
- `POST /api/categorias`
- `PUT /api/categorias/:id`
- `DELETE /api/categorias/:id`

### Jogos

- `GET /api/jogos?busca=&categoria_id=&tipo_jogo=&disponiveis=1`
- `GET /api/jogos/:id`
- `POST /api/jogos` com `multipart/form-data`
- `PUT /api/jogos/:id` com `multipart/form-data`
- `DELETE /api/jogos/:id`

### Emprestimos

- `GET /api/emprestimos?status=&usuario_id=&atrasados=1`
- `GET /api/emprestimos/:id`
- `POST /api/emprestimos`
- `PUT /api/emprestimos/:id`
- `POST /api/emprestimos/:id/devolver`
- `DELETE /api/emprestimos/:id`

Exemplo de criacao:

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

### Dashboard, dados, logs e relatorios

- `GET /api/dashboard/resumo`
- `GET /api/exportacao/:entidade`
- `POST /api/importacao/:entidade`
- `GET /api/logs`
- `GET /api/logs/exportar/xml`
- `GET /api/relatorios/jogos/pdf`
- `GET /api/relatorios/emprestimos/pdf`

## Banco de dados

O MySQL possui 5 tabelas principais relacionadas:

- `usuarios`
- `categorias`
- `jogos`
- `emprestimos`
- `itens_emprestimo`

Relacionamentos:

- `usuarios` 1:N `emprestimos`
- `categorias` 1:N `jogos`
- `emprestimos` N:N `jogos` via `itens_emprestimo`

O arquivo [database/exemplos_consultas.sql](database/exemplos_consultas.sql) demonstra consultas com `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `WHERE`, operadores logicos, filtros e relacionamentos.

## Observacao para apresentacao

O projeto foi escrito de forma didatica, deixando as camadas separadas para facilitar a explicacao:

`Router -> Middleware -> Controller -> Service -> DAO -> Model/Banco`
