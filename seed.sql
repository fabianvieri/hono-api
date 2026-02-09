BEGIN TRANSACTION;

INSERT INTO users (id, username, email, password, created_at, updated_at) VALUES
  ('u_alice', 'alice', 'alice@example.com', 'password123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('u_bob', 'bob', 'bob@example.com', 'password123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO budgets (id, user_id, name, amount, created_at, updated_at) VALUES
  ('b_groceries', 'u_alice', 'Groceries', 300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('b_rent', 'u_alice', 'Rent', 1200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('b_travel', 'u_bob', 'Travel', 500, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;