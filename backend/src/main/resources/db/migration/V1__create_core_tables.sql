

CREATE TABLE IF NOT EXISTS users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    user_type       ENUM('client', 'lawyer', 'admin') NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone_number    VARCHAR(20),
    city            VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_date TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id   INT NOT NULL UNIQUE,
    CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS lawyers (
    lawyer_id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id                INT NOT NULL UNIQUE,
    bar_number             VARCHAR(100) NOT NULL UNIQUE,
    state_licensed         VARCHAR(100),
    years_experience       VARCHAR(50),
    primary_specialization VARCHAR(100),
    city_practice          VARCHAR(100),
    hourly_rate            VARCHAR(50),
    bio                    TEXT,
    is_verified            BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_lawyers_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS cases (
    case_id          INT AUTO_INCREMENT PRIMARY KEY,
    client_id        INT NOT NULL,
    lawyer_id        INT NULL,                       
    case_title       VARCHAR(255),
    case_type        VARCHAR(100),
    case_description TEXT,
    city             VARCHAR(100),
    urgency          VARCHAR(50),
    budget           VARCHAR(100),
    document_path    VARCHAR(500),
    case_status      ENUM('pending', 'active', 'in_progress', 'resolved', 'closed')
                         NOT NULL DEFAULT 'pending',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cases_client FOREIGN KEY (client_id) REFERENCES clients (client_id),
    CONSTRAINT fk_cases_lawyer FOREIGN KEY (lawyer_id) REFERENCES lawyers (lawyer_id)
);
