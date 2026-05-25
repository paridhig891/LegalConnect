
CREATE TABLE IF NOT EXISTS case_timeline (
    timeline_id   INT AUTO_INCREMENT PRIMARY KEY,
    case_id       INT NOT NULL,
    actor_user_id INT NULL,                            -- null for system-generated entries
    status        VARCHAR(50) NOT NULL,
    note          TEXT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_timeline_case FOREIGN KEY (case_id) REFERENCES cases (case_id),
    CONSTRAINT fk_timeline_actor FOREIGN KEY (actor_user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    title           VARCHAR(150) NOT NULL,
    message         TEXT NOT NULL,
    type            VARCHAR(50) NOT NULL DEFAULT 'info',  -- case_request, case_status, review, admin, info
    related_case_id INT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_notifications_case FOREIGN KEY (related_case_id) REFERENCES cases (case_id)
);

CREATE TABLE IF NOT EXISTS case_messages (
    message_id     INT AUTO_INCREMENT PRIMARY KEY,
    case_id        INT NOT NULL,
    sender_user_id INT NOT NULL,
    message_text   TEXT NULL,
    file_path      VARCHAR(500) NULL,
    is_read        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_case FOREIGN KEY (case_id) REFERENCES cases (case_id),
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS lawyer_reviews (
    review_id       INT AUTO_INCREMENT PRIMARY KEY,
    case_id         INT NOT NULL UNIQUE,               -- one review per case
    client_user_id  INT NOT NULL,
    lawyer_user_id  INT NOT NULL,
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text     TEXT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_case   FOREIGN KEY (case_id)        REFERENCES cases (case_id),
    CONSTRAINT fk_reviews_client FOREIGN KEY (client_user_id) REFERENCES users (user_id),
    CONSTRAINT fk_reviews_lawyer FOREIGN KEY (lawyer_user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS complaints (
    complaint_id         INT AUTO_INCREMENT PRIMARY KEY,
    case_id              INT NOT NULL,
    complainant_user_id  INT NOT NULL,
    against_user_id      INT NOT NULL,
    description          TEXT NOT NULL,
    status               VARCHAR(30) NOT NULL DEFAULT 'open',  -- open, in_review, resolved
    resolution_note      TEXT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at          TIMESTAMP NULL,
    CONSTRAINT fk_complaints_case        FOREIGN KEY (case_id)             REFERENCES cases (case_id),
    CONSTRAINT fk_complaints_complainant FOREIGN KEY (complainant_user_id) REFERENCES users (user_id),
    CONSTRAINT fk_complaints_against     FOREIGN KEY (against_user_id)     REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS admin_logs (
    log_id         INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id  INT NOT NULL,
    target_user_id INT NULL,
    action_type    VARCHAR(80) NOT NULL,              
    details        TEXT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_admin  FOREIGN KEY (admin_user_id)  REFERENCES users (user_id),
    CONSTRAINT fk_logs_target FOREIGN KEY (target_user_id) REFERENCES users (user_id)
);
