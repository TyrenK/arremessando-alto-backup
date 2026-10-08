CREATE DATABASE IF NOT EXISTS arremessandoAlto;
USE arremessandoAlto;

-- Níveis de experiência do jogador
CREATE TABLE ExperienciaBasquete (
    id_exp_basq INT PRIMARY KEY AUTO_INCREMENT,
    exp_basq ENUM('iniciante', 'intermediario', 'experiente', 'profissional') NOT NULL
);

-- Dados do jogador
CREATE TABLE Jogador (
    id_jogador INT PRIMARY KEY AUTO_INCREMENT,
    foto_url VARCHAR(500) NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    id_exp_basq INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_exp_basq) REFERENCES ExperienciaBasquete(id_exp_basq)
);

CREATE TABLE Aulas (
    id_aula INT PRIMARY KEY AUTO_INCREMENT,
    gif_url VARCHAR(500) NULL,
    semana INT NOT NULL,
    dia INT NOT NULL,
    numero_aula INT NOT NULL,
    titulo VARCHAR(100),
    explicacao VARCHAR(1000)
);

-- Aulas concluídas por cada jogador (uma linha = jogador concluiu a aula).
-- Marcar = inserir a linha; desmarcar = apagar a linha. Cada aula é independente.
CREATE TABLE AulaConcluida (
    id_jogador INT NOT NULL,
    id_aula INT NOT NULL,
    data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_jogador, id_aula),
    FOREIGN KEY (id_jogador) REFERENCES Jogador(id_jogador) ON DELETE CASCADE,
    FOREIGN KEY (id_aula) REFERENCES Aulas(id_aula) ON DELETE CASCADE
);

-- Registros de aproveitamento dos treinos
CREATE TABLE RegistroAproveitamento (
    id_reg_aprov INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(150) DEFAULT 'Treino Livre',
    tentativas INT DEFAULT 0,
    acertos INT DEFAULT 0,
    aproveitamento DECIMAL(5,2) DEFAULT 0,
    tempo VARCHAR(10) DEFAULT NULL,
    id_jogador INT NOT NULL,
    id_aula INT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_jogador) REFERENCES Jogador(id_jogador) ON DELETE CASCADE,
    FOREIGN KEY (id_aula) REFERENCES Aulas(id_aula)
);

-- ─── DADOS INICIAIS ───────────────────────────────────────────────────────────

INSERT INTO ExperienciaBasquete (exp_basq) VALUES
    ('iniciante'),
    ('intermediario'),
    ('experiente'),
    ('profissional');

-- ─── PROCEDURES ──────────────────────────────────────────────────────────────

DELIMITER $$

-- Cria um novo jogador (usada no cadastro)
CREATE PROCEDURE AdicionarJogador(
    IN p_email VARCHAR(50),
    IN p_senha VARCHAR(255),
    IN p_nome VARCHAR(100),
    IN p_data_nascimento DATE,
    IN p_id_exp_basq INT
)
BEGIN
    INSERT INTO Jogador (email, senha, nome, data_nascimento, id_exp_basq)
    VALUES (p_email, p_senha, p_nome, p_data_nascimento, p_id_exp_basq);
END$$

-- Atualiza nome, email e data de nascimento (usada na edição de perfil)
CREATE PROCEDURE AtualizarDadosJogador(
    IN p_id_jogador INT,
    IN p_nome VARCHAR(100),
    IN p_email VARCHAR(50),
    IN p_data_nascimento DATE
)
BEGIN
    UPDATE Jogador
    SET nome = p_nome,
        email = p_email,
        data_nascimento = p_data_nascimento
    WHERE id_jogador = p_id_jogador;
END$$

-- Atualiza o nível de experiência (usada no formulário inicial e edição)
CREATE PROCEDURE AtualizarExperienciaJogador(
    IN p_id_jogador INT,
    IN p_exp_basq VARCHAR(20)
)
BEGIN
    UPDATE Jogador
    SET id_exp_basq = (
        SELECT id_exp_basq FROM ExperienciaBasquete
        WHERE exp_basq = p_exp_basq
        LIMIT 1
    )
    WHERE id_jogador = p_id_jogador;
END$$

DELIMITER ;