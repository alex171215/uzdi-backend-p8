-- ============================================================
-- CATÁLOGOS Y DATOS INICIALES DEL SISTEMA UZDI / SNAI
-- Tareas 2.3, 3.3, 3.4 — Carga inicial de datos operativos
-- Idempotente: seguro para ejecutar múltiples veces
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Estructura Institucional: Provincias
-- ------------------------------------------------------------
INSERT INTO estructura_institucional.provincia (prov_id, nombre, estado) VALUES
(1, 'Pichincha', 'V'),
(2, 'Guayas', 'V'),
(3, 'Azuay', 'V'),
(4, 'Tungurahua', 'V'),
(5, 'Manabí', 'V'),
(6, 'Chimborazo', 'V'),
(7, 'El Oro', 'V'),
(8, 'Imbabura', 'V'),
(9, 'Loja', 'V'),
(10, 'Cotopaxi', 'V'),
(11, 'Esmeraldas', 'V'),
(12, 'Santo Domingo de los Tsáchilas', 'V')
ON CONFLICT (nombre) DO UPDATE SET estado = 'V';
SELECT setval('estructura_institucional.provincia_prov_id_seq', (SELECT MAX(prov_id) FROM estructura_institucional.provincia));

-- ------------------------------------------------------------
-- 2. Estructura Institucional: Cantones
-- ------------------------------------------------------------
INSERT INTO estructura_institucional.canton (cntn_id, prov_id, nombre, estado) VALUES
-- Pichincha
(1, 1, 'Quito', 'V'),
(2, 1, 'Rumiñahui', 'V'),
(3, 1, 'Mejía', 'V'),
(4, 1, 'Cayambe', 'V'),
-- Guayas
(5, 2, 'Guayaquil', 'V'),
(6, 2, 'Durán', 'V'),
(7, 2, 'Samborondón', 'V'),
(8, 2, 'Daule', 'V'),
-- Azuay
(9, 3, 'Cuenca', 'V'),
(10, 3, 'Gualaceo', 'V'),
-- Tungurahua
(11, 4, 'Ambato', 'V'),
(12, 4, 'Baños de Agua Santa', 'V'),
-- Manabí
(13, 5, 'Portoviejo', 'V'),
(14, 5, 'Manta', 'V'),
-- Chimborazo
(15, 6, 'Riobamba', 'V'),
-- El Oro
(16, 7, 'Machala', 'V'),
-- Imbabura
(17, 8, 'Ibarra', 'V'),
(18, 8, 'Otavalo', 'V'),
-- Loja
(19, 9, 'Loja', 'V'),
-- Cotopaxi
(20, 10, 'Latacunga', 'V'),
-- Esmeraldas
(21, 11, 'Esmeraldas', 'V'),
-- Santo Domingo
(22, 12, 'Santo Domingo', 'V')
ON CONFLICT (prov_id, nombre) DO UPDATE SET estado = 'V';
SELECT setval('estructura_institucional.canton_cntn_id_seq', (SELECT MAX(cntn_id) FROM estructura_institucional.canton));

-- ------------------------------------------------------------
-- 3. Estructura Institucional: Sedes UZDI
-- ------------------------------------------------------------
INSERT INTO estructura_institucional.uzdi (uzdi_id, cntn_id, nombre, zona, direccion, telefono, correo, estado) VALUES
(1, 1, 'UZDI Pichincha - Centro Norte', 'Zona 9 - DMQ', 'Av. 10 de Agosto N25-32 y Colón, Quito', '022567890', 'uzdi.pichincha@snai.gob.ec', 'V'),
(2, 1, 'UZDI Pichincha - Sur', 'Zona 9 - DMQ', 'Av. Rodrigo de Chávez y 5 de Junio, Quito', '022678901', 'uzdi.sur@snai.gob.ec', 'V'),
(3, 5, 'UZDI Guayas - Guayaquil Centro', 'Zona 8', 'Av. 9 de Octubre y Pedro Carbo, Guayaquil', '042345678', 'uzdi.guayas@snai.gob.ec', 'V'),
(4, 9, 'UZDI Azuay - Cuenca', 'Zona 6', 'Calle Larga y Benigno Malo, Cuenca', '072834567', 'uzdi.azuay@snai.gob.ec', 'V'),
(5, 11, 'UZDI Tungurahua - Ambato', 'Zona 3', 'Calle Bolívar y Castillo, Ambato', '032823456', 'uzdi.tungurahua@snai.gob.ec', 'V'),
(6, 13, 'UZDI Manabí - Portoviejo', 'Zona 4', 'Calle Rocafuerte y 10 de Agosto, Portoviejo', '052634567', 'uzdi.manabi@snai.gob.ec', 'V')
ON CONFLICT (uzdi_id) DO UPDATE SET estado = 'V';
SELECT setval('estructura_institucional.uzdi_uzdi_id_seq', (SELECT MAX(uzdi_id) FROM estructura_institucional.uzdi));

-- ------------------------------------------------------------
-- 4. Catálogos de Adolescente: Nacionalidades
-- ------------------------------------------------------------
INSERT INTO adolescente.nacionalidad (nacn_id, nombre, estado) VALUES
(1, 'Ecuatoriana', 'V'),
(2, 'Colombiana', 'V'),
(3, 'Venezolana', 'V'),
(4, 'Peruana', 'V'),
(5, 'Estadounidense', 'V'),
(6, 'Haitiana', 'V'),
(7, 'Otra', 'V')
ON CONFLICT (nombre) DO UPDATE SET estado = 'V';
SELECT setval('adolescente.nacionalidad_nacn_id_seq', (SELECT MAX(nacn_id) FROM adolescente.nacionalidad));

-- ------------------------------------------------------------
-- 5. Catálogos de Adolescente: Grupos Delictivos Organizados (GDO)
-- ------------------------------------------------------------
INSERT INTO adolescente.gdo (gdo_id, nombre, estado) VALUES
(1, 'Ninguno / No identificado', 'V'),
(2, 'Los Choneros', 'V'),
(3, 'Los Lobos', 'V'),
(4, 'Los Tiguerones', 'V'),
(5, 'Los Lagartos', 'V'),
(6, 'Chone Killers', 'V'),
(7, 'Latin Kings', 'V'),
(8, 'Mafia 18', 'V'),
(9, 'Los Águilas', 'V')
ON CONFLICT (nombre) DO UPDATE SET estado = 'V';
SELECT setval('adolescente.gdo_gdo_id_seq', (SELECT MAX(gdo_id) FROM adolescente.gdo));

-- ------------------------------------------------------------
-- 6. Catálogos de Adolescente: Infracciones Tipificadas
-- ------------------------------------------------------------
INSERT INTO adolescente.infraccion (infc_id, nombre, categoria, articulo_cona, descripcion, estado) VALUES
(1, 'Robo simple', 'Delito contra la propiedad', 'Art. 189 COIP', 'Apoderamiento ilegítimo de cosa mueble ajena sin violencia ni fuerza.', 'V'),
(2, 'Robo con fuerza en las cosas', 'Delito contra la propiedad', 'Art. 189 COIP', 'Apoderamiento de bienes fracturando cerraduras, puertas o ventanas.', 'V'),
(3, 'Robo con violencia o intimidación', 'Delito contra la propiedad', 'Art. 189 COIP', 'Apoderamiento ilegítimo empleando amenazas directas o violencia.', 'V'),
(4, 'Hurto', 'Delito contra la propiedad', 'Art. 196 COIP', 'Sustracción de bienes sin violencia, amenazas ni fractura.', 'V'),
(5, 'Tráfico ilícito de sustancias catalogadas sujetas a fiscalización (Mínima y Mediana escala)', 'Delitos contra la salud pública', 'Art. 220 COIP', 'Tenencia o expendio no autorizado en escala mínima o mediana.', 'V'),
(6, 'Receptación', 'Delito contra la propiedad', 'Art. 202 COIP', 'Tenencia, custodia o comercialización de bienes de procedencia injustificada o robados.', 'V'),
(7, 'Lesiones', 'Delito contra la integridad personal', 'Art. 152 COIP', 'Afectación a la integridad física o salud con incapacidad temporal.', 'V'),
(8, 'Homicidio simple', 'Delito contra la vida', 'Art. 144 COIP', 'Privación de la vida de una persona.', 'V'),
(9, 'Tenencia y porte no autorizado de armas', 'Delitos contra la seguridad pública', 'Art. 360 COIP', 'Porte de armas de fuego o armas cortopunzantes en espacio público.', 'V'),
(10, 'Extorsión', 'Delito contra la propiedad', 'Art. 185 COIP', 'Obligar a otro mediante violencia o intimidación a entregar dinero o bienes.', 'V'),
(11, 'Intimidación', 'Delito contra la libertad individual', 'Art. 154 COIP', 'Amenazar gravemente a otra persona con causar daño a su persona o familia.', 'V')
ON CONFLICT (infc_id) DO UPDATE SET estado = 'V';
SELECT setval('adolescente.infraccion_infc_id_seq', (SELECT MAX(infc_id) FROM adolescente.infraccion));

-- ------------------------------------------------------------
-- 7. Catálogos de Adolescente: Medidas Socioeducativas (CONA)
-- ------------------------------------------------------------
INSERT INTO adolescente.medida_socioeducativa (mdso_id, nombre, duracion_meses, estado) VALUES
(1, 'Amonestación e imposición de reglas de conducta', 6, 'V'),
(2, 'Orientación y apoyo familiar', 6, 'V'),
(3, 'Servicio a la comunidad', 6, 'V'),
(4, 'Libertad asistida', 12, 'V'),
(5, 'Reparación del daño causado a la víctima', 3, 'V'),
(6, 'Permanencia durante los fines de semana en un centro', 6, 'V'),
(7, 'Privación de libertad en centro de adolescentes infractores (CAI)', 24, 'V')
ON CONFLICT (nombre) DO UPDATE SET estado = 'V', duracion_meses = EXCLUDED.duracion_meses;
SELECT setval('adolescente.medida_socioeducativa_mdso_id_seq', (SELECT MAX(mdso_id) FROM adolescente.medida_socioeducativa));

COMMIT;
