CREATE DATABASE IF NOT EXISTS arremessandoAlto;
USE arremessandoAlto;

-- Níveis de experiência do jogador
CREATE TABLE ExperienciaBasquete (
    id_exp_basq INT PRIMARY KEY AUTO_INCREMENT,
    exp_basq ENUM('iniciante', 'intermediario', 'experiente', 'profissional') NOT NULL
);

-- Progresso do jogador nas aulas (qual foi a última aula feita)
CREATE TABLE ProgressoAula (
    id_prog_aula INT PRIMARY KEY AUTO_INCREMENT,
    semana_ult_aula INT DEFAULT 1,
    dia_ult_aula INT DEFAULT 1,
    ult_aula_realizada INT DEFAULT 0
);

-- Dados do jogador
CREATE TABLE Jogador (
    id_jogador INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    id_exp_basq INT,
    id_prog_aula INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_exp_basq) REFERENCES ExperienciaBasquete(id_exp_basq),
    FOREIGN KEY (id_prog_aula) REFERENCES ProgressoAula(id_prog_aula)
);

-- Aulas do curso com suporte a vídeo do YouTube
CREATE TABLE Aulas (
    id_aula INT PRIMARY KEY AUTO_INCREMENT,
    semana INT NOT NULL,
    dia INT NOT NULL,
    numero_aula INT NOT NULL,
    titulo VARCHAR(100),
    explicacao VARCHAR(1000),
    pratica BOOLEAN DEFAULT FALSE,
    youtube_id VARCHAR(20) DEFAULT NULL
);

-- Registros de aproveitamento dos treinos
CREATE TABLE RegistroAproveitamento (
    id_reg_aprov INT PRIMARY KEY AUTO_INCREMENT,
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
    IN p_id_exp_basq INT,
    IN p_id_prog_aula INT
)
BEGIN
    INSERT INTO Jogador (email, senha, nome, data_nascimento, id_exp_basq, id_prog_aula)
    VALUES (p_email, p_senha, p_nome, p_data_nascimento, p_id_exp_basq, p_id_prog_aula);
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

-- Busca o progresso do jogador nas aulas (usada na TelaHome e TelaTreino)
CREATE PROCEDURE BuscarProgressoJogador(IN p_id_jogador INT)
BEGIN
    SELECT
        pa.semana_ult_aula,
        pa.dia_ult_aula,
        pa.ult_aula_realizada
    FROM Jogador j
    INNER JOIN ProgressoAula pa ON j.id_prog_aula = pa.id_prog_aula
    WHERE j.id_jogador = p_id_jogador;
END$$

DELIMITER ;