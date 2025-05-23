CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    date_of_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);