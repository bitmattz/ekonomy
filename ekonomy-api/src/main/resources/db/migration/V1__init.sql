-- Sequences expected by Hibernate 6 (allocationSize=50)
CREATE SEQUENCE users_seq        START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE categories_seq   START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE accounts_seq     START WITH 1 INCREMENT BY 50;
CREATE SEQUENCE transactions_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE users (
    id          BIGINT        PRIMARY KEY DEFAULT nextval('users_seq'),
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    role        VARCHAR(50)   NOT NULL DEFAULT 'ADMIN',
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id      BIGINT       PRIMARY KEY DEFAULT nextval('categories_seq'),
    name    VARCHAR(100) NOT NULL,
    type    VARCHAR(20)  NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    icon    VARCHAR(50),
    color   VARCHAR(20),
    user_id BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE accounts (
    id         BIGINT         PRIMARY KEY DEFAULT nextval('accounts_seq'),
    name       VARCHAR(100)   NOT NULL,
    type       VARCHAR(50)    NOT NULL CHECK (type IN ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'WALLET')),
    balance    DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency   VARCHAR(3)     NOT NULL DEFAULT 'BRL',
    user_id    BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id          BIGINT         PRIMARY KEY DEFAULT nextval('transactions_seq'),
    description VARCHAR(255)   NOT NULL,
    amount      DECIMAL(15, 2) NOT NULL,
    type        VARCHAR(20)    NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    date        DATE           NOT NULL,
    account_id  BIGINT         NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    category_id BIGINT         REFERENCES categories (id) ON DELETE SET NULL,
    user_id     BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    notes       TEXT,
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_date ON transactions (user_id, date DESC);
CREATE INDEX idx_transactions_account   ON transactions (account_id);
CREATE INDEX idx_accounts_user          ON accounts (user_id);
CREATE INDEX idx_categories_user        ON categories (user_id);
