CREATE SEQUENCE salary_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE salary (
    id BIGINT PRIMARY KEY DEFAULT nextval('salary_seq'),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    investment_percentage DECIMAL(4,2) NOT NULL DEFAULT 0,
    lifestyle_percentage DECIMAL(4,2) NOT NULL DEFAULT 0,
    emergency_percentage DECIMAL(4,2) NOT NULL DEFAULT 0,
    reward_percentage DECIMAL(4,2) NOT NULL DEFAULT 0,
    user_id     BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_salary_user   ON salary (user_id);






