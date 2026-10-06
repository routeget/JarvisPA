-- Enable pgvector extension per Section 14 & 5.4
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema initialization is automatically handled by SQLAlchemy models,
-- but pgvector extension is ensured here.
