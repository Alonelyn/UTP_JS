-- Migración: Agregar columnas necesarias para tiempo mínimo y contenido enriquecido
-- Ejecutar una sola vez en la base de datos

-- Tiempo mínimo en segundos que el alumno debe estar en la lección para completarla
ALTER TABLE "Leccion"
  ADD COLUMN IF NOT EXISTS duracion_minima INTEGER DEFAULT 60;

-- Reto práctico de la lección (texto descriptivo del ejercicio)
ALTER TABLE "Leccion"
  ADD COLUMN IF NOT EXISTS reto_practico TEXT;

-- Dificultad de la lección
ALTER TABLE "Leccion"
  ADD COLUMN IF NOT EXISTS dificultad VARCHAR(20) DEFAULT 'básico';

-- URL de imagen de portada de la lección
ALTER TABLE "Leccion"
  ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- Tiempo activo acumulado del alumno (en segundos) en la tabla de progreso
ALTER TABLE "Progreso_Leccion"
  ADD COLUMN IF NOT EXISTS tiempo_activo INTEGER DEFAULT 0;

-- Confirmar los cambios
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('Leccion', 'Progreso_Leccion')
  AND column_name IN ('duracion_minima', 'reto_practico', 'dificultad', 'imagen_url', 'tiempo_activo')
ORDER BY table_name, column_name;
