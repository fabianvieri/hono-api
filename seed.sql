-- Minimal seed data for users and budgets
BEGIN TRANSACTION;

INSERT INTO users (id, username, email, password, created_at, updated_at) VALUES
  (1, 'alice', 'alice@example.com', 'password123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'bob', 'bob@example.com', 'password123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO budgets (id, user_id, name, amount, created_at, updated_at) VALUES
  (1, 1, 'Groceries', 300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 'Rent', 1200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 2, 'Travel', 500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;