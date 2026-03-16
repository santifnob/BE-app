-- Sample data insertion script for ferrocarril database
-- This script inserts test data to cover various business rules and scenarios
-- including valid cases, invalid cases (e.g., driver without license, overlapping trips, etc.)
-- Current date assumed: 2026-03-16

-- Insert Tipo de Carga
INSERT INTO tipo_carga (created_at, updated_at, name, `desc`, estado) VALUES
(NOW(), NOW(), 'Granel', 'Carga a granel como granos o minerales', 'Activo'),
(NOW(), NOW(), 'Contenedor', 'Carga en contenedores estandarizados', 'Activo'),
(NOW(), NOW(), 'Liquida', 'Carga liquida como petroleo o agua', 'Inactivo');

-- Insert Carga
INSERT INTO carga (created_at, updated_at, name, precio, tipo_carga_id, estado) VALUES
(NOW(), NOW(), 'Trigo', 100.00, 1, 'Activo'),
(NOW(), NOW(), 'Maiz', 120.50, 1, 'Activo'),
(NOW(), NOW(), 'Contenedor Electronica', 250.00, 2, 'Activo'),
(NOW(), NOW(), 'Petroleo', 350.75, 3, 'Inactivo'),
(NOW(), NOW(), 'Contenedor Ropa', 180.00, 2, 'Activo');

-- Insert Conductor
INSERT INTO conductor (created_at, updated_at, nombre, apellido, email, password, estado) VALUES
(NOW(), NOW(), 'Juan', 'Perez', 'juan.perez@example.com', 'password123', 'Activo'),
(NOW(), NOW(), 'Maria', 'Gomez', 'maria.gomez@example.com', 'password123', 'Activo'),
(NOW(), NOW(), 'Pedro', 'Lopez', 'pedro.lopez@example.com', 'password123', 'Activo'),
(NOW(), NOW(), 'Ana', 'Rodriguez', 'ana.rodriguez@example.com', 'password123', 'Inactivo'),
(NOW(), NOW(), 'Carlos', 'Martinez', 'carlos.martinez@example.com', 'password123', 'Activo');

-- Insert Licencia
-- Juan: Valid license covering future dates
INSERT INTO licencia (created_at, updated_at, estado, fecha_hecho, fecha_vencimiento, conductor_id) VALUES
(NOW(), NOW(), 'Activo', '2024-01-01', '2030-01-01', 1);
-- Maria: Expired license
INSERT INTO licencia (created_at, updated_at, estado, fecha_hecho, fecha_vencimiento, conductor_id) VALUES
(NOW(), NOW(), 'Activo', '2020-01-01', '2025-12-31', 2);
-- Carlos: Valid license
INSERT INTO licencia (created_at, updated_at, estado, fecha_hecho, fecha_vencimiento, conductor_id) VALUES
(NOW(), NOW(), 'Activo', '2025-01-01', '2028-01-01', 5);
-- Pedro and Ana: No licenses (to test scenarios without license)

-- Insert Tren
INSERT INTO tren (created_at, updated_at, color, modelo) VALUES
(NOW(), NOW(), 'Rojo', 'Modelo A - Alta Velocidad'),
(NOW(), NOW(), 'Azul', 'Modelo B - Carga Pesada'),
(NOW(), NOW(), 'Verde', 'Modelo C - Regional'),
(NOW(), NOW(), 'Amarillo', 'Modelo D - Mixto');

-- Insert Estado Tren
-- Tren 1: Disponible
INSERT INTO estado_tren (created_at, updated_at, nombre, fecha_vigencia, tren_id, estado) VALUES
(NOW(), NOW(), 'Disponible', '2026-03-16', 1, 'Activo');
-- Tren 2: En reparacion
INSERT INTO estado_tren (created_at, updated_at, nombre, fecha_vigencia, tren_id, estado) VALUES
(NOW(), NOW(), 'En reparacion', '2026-03-16', 2, 'Activo');
-- Tren 3: Disponible
INSERT INTO estado_tren (created_at, updated_at, nombre, fecha_vigencia, tren_id, estado) VALUES
(NOW(), NOW(), 'Disponible', '2026-03-16', 3, 'Activo');
-- Tren 4: Obsoleto
INSERT INTO estado_tren (created_at, updated_at, nombre, fecha_vigencia, tren_id, estado) VALUES
(NOW(), NOW(), 'Obsoleto', '2026-03-16', 4, 'Activo');

-- Insert Recorrido
INSERT INTO recorrido (created_at, updated_at, ciudad_salida, ciudad_llegada, total_km, estado) VALUES
(NOW(), NOW(), 'Buenos Aires', 'Cordoba', 700, 'Activo'),
(NOW(), NOW(), 'Cordoba', 'Mendoza', 500, 'Activo'),
(NOW(), NOW(), 'Buenos Aires', 'Rosario', 300, 'Inactivo'),
(NOW(), NOW(), 'Rosario', 'Santa Fe', 200, 'Activo');

-- Insert Viaje
-- Viaje 1: Valid - Juan (has valid license), Tren 1 (Disponible), Recorrido 1 (Activo), Future dates -> Programado
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-04-01 10:00:00', '2026-04-01 18:00:00', 'Activo', 1, 1, 1);

-- Viaje 2: Finalizado - Juan, Tren 3 (Disponible), Recorrido 2 (Activo), Past dates
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-03-10 10:00:00', '2026-03-10 18:00:00', 'Activo', 3, 2, 1);

-- Viaje 3: Pendiente - Maria (expired license), Tren 1 (Disponible), Recorrido 1 (Activo), Future date -> Pendiente (but license expired, testing scenario)
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-05-01 10:00:00', '2026-05-01 18:00:00', 'Pendiente', 1, 1, 2);

-- Viaje 4: Rechazado - Pedro (no license), Tren 3 (Disponible), Recorrido 2 (Activo)
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-06-01 10:00:00', '2026-06-01 18:00:00', 'Rechazado', 3, 2, 3);

-- Viaje 5: Activo - Juan (overlapping? No, different date), Tren 3 (Disponible), Recorrido 2 (Activo), Future -> Programado
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-04-02 10:00:00', '2026-04-02 18:00:00', 'Activo', 3, 2, 1);

-- Viaje 6: Inactivo (Cancelado) - Juan, Tren 2 (En reparacion, testing invalid tren state), Recorrido 1 (Activo)
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-07-01 10:00:00', '2026-07-01 18:00:00', 'Inactivo', 2, 1, 1);

-- Viaje 7: Pendiente - Carlos (valid license), Tren 3 (Disponible), Recorrido 3 (Inactivo, testing invalid recorrido)
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-08-01 10:00:00', '2026-08-01 18:00:00', 'Pendiente', 3, 3, 5);

-- Viaje 8: En curso - Carlos, Tren 4 (but estado_tren is Obsoleto, testing), Recorrido 4 (Activo), Current dates
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-03-15 10:00:00', '2026-03-17 18:00:00', 'Activo', 4, 4, 5);

-- Viaje 9: Viaje no aceptado - Ana (inactive conductor), Tren 1 (Disponible), Recorrido 1 (Activo), Past fecha_ini
INSERT INTO viaje (created_at, updated_at, fecha_ini, fecha_fin, estado, tren_id, recorrido_id, conductor_id) VALUES
(NOW(), NOW(), '2026-03-10 10:00:00', '2026-03-10 18:00:00', 'Pendiente', 1, 1, 4);

-- Insert Linea Carga
-- For Viaje 1
INSERT INTO linea_carga (created_at, updated_at, cantidad_vagon, carga_id, viaje_id, estado) VALUES
(NOW(), NOW(), 5, 1, 1, 'Activo'),
(NOW(), NOW(), 3, 2, 1, 'Activo');

-- For Viaje 2
INSERT INTO linea_carga (created_at, updated_at, cantidad_vagon, carga_id, viaje_id, estado) VALUES
(NOW(), NOW(), 2, 3, 2, 'Activo'),
(NOW(), NOW(), 4, 5, 2, 'Activo');

-- For Viaje 5
INSERT INTO linea_carga (created_at, updated_at, cantidad_vagon, carga_id, viaje_id, estado) VALUES
(NOW(), NOW(), 1, 4, 5, 'Inactivo'); -- Inactive carga

-- For Viaje 8
INSERT INTO linea_carga (created_at, updated_at, cantidad_vagon, carga_id, viaje_id, estado) VALUES
(NOW(), NOW(), 6, 1, 8, 'Activo');

-- Insert Categoria Denuncia
INSERT INTO categoria_denuncia (created_at, updated_at, titulo, descripcion, estado) VALUES
(NOW(), NOW(), 'Retraso en llegada', 'El viaje llegó con retraso significativo', 'Activo'),
(NOW(), NOW(), 'Daño en mercancia', 'La carga sufrió daños durante el transporte', 'Activo'),
(NOW(), NOW(), 'Falta de mantenimiento', 'El tren presentaba problemas de mantenimiento', 'Activo'),
(NOW(), NOW(), 'Comportamiento del conductor', 'Problemas con el comportamiento del conductor', 'Inactivo');

-- Insert Observacion
-- For Viaje 1
INSERT INTO observacion (created_at, updated_at, observaciones, categoria_denuncia_id, viaje_id, estado) VALUES
(NOW(), NOW(), 'El viaje llegó 30 minutos tarde debido a condiciones climaticas', 1, 1, 'Activo');

-- For Viaje 2
INSERT INTO observacion (created_at, updated_at, observaciones, categoria_denuncia_id, viaje_id, estado) VALUES
(NOW(), NOW(), 'La carga de contenedores sufrió daños menores en el embalaje', 2, 2, 'Activo');

-- For Viaje 4
INSERT INTO observacion (created_at, updated_at, observaciones, categoria_denuncia_id, viaje_id, estado) VALUES
(NOW(), NOW(), 'Conductor no tenía licencia valida para la fecha del viaje', 4, 4, 'Activo');

-- For Viaje 6
INSERT INTO observacion (created_at, updated_at, observaciones, categoria_denuncia_id, viaje_id, estado) VALUES
(NOW(), NOW(), 'Viaje cancelado debido a tren en reparacion', 3, 6, 'Activo');