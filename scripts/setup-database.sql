-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  level INTEGER NOT NULL DEFAULT 4,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de partidas
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger VARCHAR(100) NOT NULL,
  challenged VARCHAR(100) NOT NULL,
  winner VARCHAR(100),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'coordinated',
  match_type VARCHAR(20) DEFAULT '1v1', -- '1v1' or 'group'
  team1 TEXT[], -- Para partidas grupales
  team2 TEXT[], -- Para partidas grupales
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de desafíos
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger VARCHAR(100) NOT NULL,
  challenged VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_expires_at ON challenges(expires_at);

-- Insertar usuarios iniciales
INSERT INTO users (name, email, level) VALUES
('Chino', 'chino@agepanaderos.com', 1),
('Ruso', 'ruso@agepanaderos.com', 2),
('Mosca', 'mosca@agepanaderos.com', 2),
('Tincho', 'tincho@agepanaderos.com', 3),
('Pana', 'pana@agepanaderos.com', 3),
('Chaquinha', 'chaquinha@agepanaderos.com', 3),
('Dany', 'dany@agepanaderos.com', 4),
('Bicho', 'bicho@agepanaderos.com', 4),
('Seba', 'seba@agepanaderos.com', 4),
('Tata', 'tata@agepanaderos.com', 4),
('Mati', 'mati@agepanaderos.com', 4)
ON CONFLICT (email) DO NOTHING;

-- Insertar algunas partidas de ejemplo
INSERT INTO matches (challenger, challenged, winner, date, status) VALUES
('Ruso', 'Chino', 'Chino', '2025-01-15', 'completed'),
('Tincho', 'Mosca', 'Tincho', '2025-01-14', 'completed'),
('Mati', 'Bicho', 'Bicho', '2025-01-13', 'completed'),
('Dany', 'Pana', 'Pana', '2025-01-12', 'completed'),
('Seba', 'Dany', 'Seba', '2025-01-11', 'completed'),
('Chino', 'Ruso', 'Chino', '2025-01-10', 'completed'),
('Pana', 'Tincho', 'Pana', '2025-01-09', 'completed'),
('Bicho', 'Mati', 'Mati', '2025-01-08', 'completed')
ON CONFLICT DO NOTHING;
