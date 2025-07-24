-- Script para resetear todos los usuarios al nivel 0 (sin estrellas)
-- Nivel 0 = 4 en el sistema actual (todos empiezan desde abajo)

UPDATE users 
SET level = 4 
WHERE level IS NOT NULL;

-- Verificar los cambios
SELECT id, name, alias, level 
FROM users 
ORDER BY level DESC, name ASC;
