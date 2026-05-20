-- Banco principal do Sistema Web de Locadora de Jogos
-- Disciplina: Programacao Para Internet
-- Senha dos usuarios de teste: 123456

CREATE DATABASE IF NOT EXISTS locacao_jogos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE locacao_jogos;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS itens_emprestimo;
DROP TABLE IF EXISTS emprestimos;
DROP TABLE IF EXISTS jogos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  tipo_usuario ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE jogos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(140) NOT NULL,
  descricao TEXT,
  categoria_id INT NOT NULL,
  tipo_jogo ENUM('video_game', 'board_game') NOT NULL,
  plataforma VARCHAR(80),
  valor_aluguel DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estoque INT NOT NULL DEFAULT 0,
  imagem VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jogos_categorias
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_jogos_valor CHECK (valor_aluguel >= 0),
  CONSTRAINT ck_jogos_estoque CHECK (estoque >= 0)
) ENGINE=InnoDB;

CREATE TABLE emprestimos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  data_emprestimo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_prevista_devolucao DATE NOT NULL,
  data_devolucao_real DATETIME NULL,
  status ENUM('ativo', 'atrasado', 'devolvido', 'cancelado') NOT NULL DEFAULT 'ativo',
  multa DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emprestimos_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_emprestimos_multa CHECK (multa >= 0),
  CONSTRAINT ck_emprestimos_valor CHECK (valor_total >= 0)
) ENGINE=InnoDB;

CREATE TABLE itens_emprestimo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  emprestimo_id INT NOT NULL,
  jogo_id INT NOT NULL,
  quantidade INT NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_itens_emprestimos
    FOREIGN KEY (emprestimo_id) REFERENCES emprestimos(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_itens_jogos
    FOREIGN KEY (jogo_id) REFERENCES jogos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_itens_quantidade CHECK (quantidade > 0),
  CONSTRAINT ck_itens_valor CHECK (valor_unitario >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_jogos_categoria ON jogos(categoria_id);
CREATE INDEX idx_jogos_titulo ON jogos(titulo);
CREATE INDEX idx_emprestimos_usuario ON emprestimos(usuario_id);
CREATE INDEX idx_emprestimos_status ON emprestimos(status);
CREATE INDEX idx_emprestimos_devolucao ON emprestimos(data_prevista_devolucao);
CREATE INDEX idx_itens_jogo ON itens_emprestimo(jogo_id);

INSERT INTO usuarios (nome, email, senha, telefone, tipo_usuario) VALUES
('Administrador Academico', 'admin@locajogos.com', '$2a$10$BTHdxQcixbn5HqF5jq/VUuxXgedEG9vNs2Bx9yGO/YIonJ4nyg.Ma', '(12) 99999-0001', 'admin'),
('Mariana Silva', 'mariana@email.com', '$2a$10$BTHdxQcixbn5HqF5jq/VUuxXgedEG9vNs2Bx9yGO/YIonJ4nyg.Ma', '(12) 98888-1010', 'cliente'),
('Lucas Oliveira', 'lucas@email.com', '$2a$10$BTHdxQcixbn5HqF5jq/VUuxXgedEG9vNs2Bx9yGO/YIonJ4nyg.Ma', '(12) 97777-2020', 'cliente');

INSERT INTO categorias (nome, descricao) VALUES
('Aventura', 'Jogos de exploracao, missao e progressao de historia.'),
('Estrategia', 'Jogos de planejamento, cartas, tabuleiro e tomada de decisao.'),
('Familia', 'Jogos para grupos, festas e partidas rapidas.'),
('RPG', 'Jogos com evolucao de personagem e narrativa.');

INSERT INTO jogos (titulo, descricao, categoria_id, tipo_jogo, plataforma, valor_aluguel, estoque, imagem) VALUES
('The Legend of Zelda: Tears of the Kingdom', 'Aventura em mundo aberto para Nintendo Switch.', 1, 'video_game', 'Nintendo Switch', 18.00, 3, NULL),
('God of War Ragnarok', 'Acao e aventura com narrativa cinematografica.', 1, 'video_game', 'PlayStation 5', 16.00, 2, NULL),
('Catan', 'Board game classico de estrategia e negociacao.', 2, 'board_game', 'Mesa', 14.00, 4, NULL),
('Ticket to Ride', 'Jogo de tabuleiro familiar com rotas ferroviarias.', 3, 'board_game', 'Mesa', 12.00, 5, NULL),
('Dungeons & Dragons Starter Set', 'Kit de RPG de mesa para iniciantes.', 4, 'board_game', 'Mesa', 20.00, 2, NULL);

INSERT INTO emprestimos (usuario_id, data_emprestimo, data_prevista_devolucao, data_devolucao_real, status, multa, valor_total, observacoes) VALUES
(2, '2026-05-12 14:20:00', '2026-05-19', NULL, 'ativo', 0.00, 18.00, 'Emprestimo de teste ainda em aberto.'),
(3, '2026-05-01 09:40:00', '2026-05-08', '2026-05-07 17:30:00', 'devolvido', 0.00, 26.00, 'Devolvido dentro do prazo.');

INSERT INTO itens_emprestimo (emprestimo_id, jogo_id, quantidade, valor_unitario) VALUES
(1, 1, 1, 18.00),
(2, 3, 1, 14.00),
(2, 4, 1, 12.00);

UPDATE jogos SET estoque = estoque - 1 WHERE id = 1 AND estoque >= 1;
