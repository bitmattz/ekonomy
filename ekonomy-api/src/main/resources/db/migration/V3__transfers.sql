ALTER TABLE transactions
    DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions
    ADD CONSTRAINT transactions_type_check
        CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER_OUT', 'TRANSFER_IN'));

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS transfer_id UUID;

CREATE INDEX IF NOT EXISTS idx_transactions_transfer
    ON transactions (transfer_id) WHERE transfer_id IS NOT NULL;
