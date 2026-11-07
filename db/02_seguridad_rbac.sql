-- ============================================================
-- SEGURIDAD — Asignación persona↔perfil y matriz RBAC del recuadro ER CAI
-- Sistema SNAI / UZDI — complemento del DDL v8 (Back Ecologia (1).sql)
-- Tareas 5.2 / 5.3 / 5.4 — Alejandro Flores
--
-- Se ejecuta DESPUÉS del DDL. Es idempotente: se puede correr varias
-- veces sin duplicar datos.
--
--   psql "$DATABASE_URL" -f db/02_seguridad_rbac.sql
--
-- Contenido:
--   0. Tabla seguridad.prpf (persona ↔ perfil). El DDL v8 tiene la columna
--      sesn.prpf_id pero no la tabla; sin ella cualquier usuario podía
--      iniciar sesión con el perfil que quisiera (incluso ADM).
--   1. Usuario administrador inicial (sin él nadie puede iniciar sesión).
--   2. Catálogo de acciones (seguridad.accn) con formato recurso.operacion.
--   3. Matriz de permisos por perfil (seguridad.prms).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 0. seguridad.prpf — Perfiles asignados a cada persona
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seguridad.prpf (
    prpf_id SERIAL PRIMARY KEY,
    prsn_id INT4 NOT NULL,
    prfl_id INT4 NOT NULL,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_prpf_prsn FOREIGN KEY (prsn_id)
        REFERENCES seguridad.prsn(prsn_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_prpf_prfl FOREIGN KEY (prfl_id)
        REFERENCES seguridad.prfl(prfl_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_prpf_prsn_prfl UNIQUE (prsn_id, prfl_id),
    CONSTRAINT chk_prpf_estado CHECK (estado IN ('V', 'F'))
);
CREATE INDEX IF NOT EXISTS idx_prpf_prsn_id ON seguridad.prpf(prsn_id);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sesn_prpf') THEN
        ALTER TABLE seguridad.sesn ADD CONSTRAINT fk_sesn_prpf FOREIGN KEY (prpf_id)
            REFERENCES seguridad.prpf(prpf_id) ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_fcmod_prpf') THEN
        CREATE TRIGGER trg_fcmod_prpf BEFORE UPDATE ON seguridad.prpf
            FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_historial_prpf') THEN
        CREATE TRIGGER trg_historial_prpf AFTER INSERT OR UPDATE OR DELETE ON seguridad.prpf
            FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
    END IF;
END $$;

-- ------------------------------------------------------------
-- 1. Usuario administrador inicial
--    login: admin   |   contraseña: Admin.Uzdi2026
--    ¡CAMBIAR LA CONTRASEÑA DESPUÉS DEL PRIMER INGRESO EN PRODUCCIÓN!
-- ------------------------------------------------------------
INSERT INTO seguridad.prsn (tppr_id, prsnnmbr, prsnapll, prsnmail, prsnlogn, prsnpass, prsnobsr, estado)
SELECT tp.tppr_id, 'Administrador', 'Sistema UZDI', 'admin@uzdi.local', 'admin',
       '$2b$10$azqSM85gQLQGt7DU8HgL2OCjcuyyyqd01sFy0kdG25jNoBubwP/Uy',
       'Usuario inicial creado por 02_seguridad_rbac.sql', 'V'
  FROM seguridad.tipo_persona tp
 WHERE tp.nombre = 'Director'
ON CONFLICT (prsnlogn) DO NOTHING;

INSERT INTO seguridad.prpf (prsn_id, prfl_id, estado)
SELECT u.prsn_id, f.prfl_id, 'V'
  FROM seguridad.prsn u JOIN seguridad.prfl f ON f.prflcdgo = 'ADM'
 WHERE u.prsnlogn = 'admin'
ON CONFLICT (prsn_id, prfl_id) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Catálogo de acciones
--    Cada recurso = ruta del controlador (/api/v1/<recurso>).
--    El RolesGuard deduce: GET→consultar, POST→crear,
--    PUT/PATCH→actualizar, DELETE→eliminar.
-- ------------------------------------------------------------
CREATE TEMP TABLE tmp_recurso (
    recurso     VARCHAR(40) PRIMARY KEY,
    modulo      INT4 NOT NULL,         -- 1 seguridad, 2 adolescente, 3 familia, 4 talleres, 5 documental, 6 geografía, 7 reportes
    es_seguridad BOOLEAN NOT NULL DEFAULT FALSE
) ON COMMIT DROP;

INSERT INTO tmp_recurso (recurso, modulo, es_seguridad) VALUES
  ('users', 1, TRUE), ('persona', 1, TRUE), ('perfil', 1, TRUE), ('accion', 1, TRUE),
  ('permiso', 1, TRUE), ('sesion', 1, TRUE), ('historial', 1, TRUE),
  ('adolescente', 2, FALSE), ('expediente', 2, FALSE), ('medida-expediente', 2, FALSE),
  ('infraccion', 2, FALSE), ('medida-socioeducativa', 2, FALSE),
  ('nacionalidad', 2, FALSE), ('estado-civil', 2, FALSE), ('etnia', 2, FALSE), ('gdo', 2, FALSE),
  ('representante', 3, FALSE), ('tipo-parentesco', 3, FALSE), ('adolescente-representante', 3, FALSE),
  ('taller', 4, FALSE), ('asistencia-taller', 4, FALSE),
  ('tipo-documento', 5, FALSE), ('documento-expediente', 5, FALSE),
  ('provincia', 6, FALSE), ('canton', 6, FALSE), ('uzdi', 6, FALSE),
  ('reportes', 7, FALSE);

CREATE TEMP TABLE tmp_operacion (operacion VARCHAR(20) PRIMARY KEY, verbo VARCHAR(20), auditable INT2) ON COMMIT DROP;
INSERT INTO tmp_operacion VALUES
  ('consultar', 'Consultar', 0), ('crear', 'Crear', 1), ('actualizar', 'Actualizar', 1), ('eliminar', 'Eliminar', 1);

INSERT INTO seguridad.accn (mdlo_id, accnnmbr, accndscr, accnaudt, estado)
SELECT r.modulo,
       r.recurso || '.' || o.operacion,
       LEFT(o.verbo || ' ' || r.recurso, 63),
       o.auditable,
       'V'
  FROM tmp_recurso r CROSS JOIN tmp_operacion o
 WHERE NOT EXISTS (
        SELECT 1 FROM seguridad.accn a WHERE a.accnnmbr = r.recurso || '.' || o.operacion);

-- ------------------------------------------------------------
-- 3. Matriz de permisos (perfil → patrón de acciones)
--    Patrones con LIKE. 'NOSEG:' = solo recursos que no son de seguridad.
-- ------------------------------------------------------------
CREATE TEMP TABLE tmp_matriz (codigo VARCHAR(5), patron VARCHAR(63)) ON COMMIT DROP;
INSERT INTO tmp_matriz (codigo, patron) VALUES
  -- ADM: todo (además el guard le da acceso transversal)
  ('ADM',  '%'),

  -- CORD: supervisa todo, gestiona casos, no administra seguridad ni catálogos
  ('CORD', '%.consultar'),
  ('CORD', 'adolescente.crear'), ('CORD', 'adolescente.actualizar'),
  ('CORD', 'expediente.crear'), ('CORD', 'expediente.actualizar'),
  ('CORD', 'medida-expediente.crear'), ('CORD', 'medida-expediente.actualizar'),
  ('CORD', 'representante.crear'), ('CORD', 'representante.actualizar'),
  ('CORD', 'adolescente-representante.crear'), ('CORD', 'adolescente-representante.actualizar'),
  ('CORD', 'taller.crear'), ('CORD', 'taller.actualizar'),
  ('CORD', 'asistencia-taller.crear'), ('CORD', 'asistencia-taller.actualizar'),
  ('CORD', 'documento-expediente.crear'), ('CORD', 'documento-expediente.actualizar'),

  -- LEGAL: dominio judicial completo
  ('LEGAL', 'NOSEG:%.consultar'),
  ('LEGAL', 'expediente.%'), ('LEGAL', 'medida-expediente.%'),
  ('LEGAL', 'infraccion.%'), ('LEGAL', 'medida-socioeducativa.%'),
  ('LEGAL', 'documento-expediente.%'),
  ('LEGAL', 'adolescente.crear'), ('LEGAL', 'adolescente.actualizar'),

  -- TSOC: entorno familiar
  ('TSOC', 'NOSEG:%.consultar'),
  ('TSOC', 'representante.%'), ('TSOC', 'adolescente-representante.%'),
  ('TSOC', 'adolescente.crear'), ('TSOC', 'adolescente.actualizar'),
  ('TSOC', 'documento-expediente.crear'), ('TSOC', 'documento-expediente.actualizar'),

  -- PSIC: seguimiento psicológico
  ('PSIC', 'NOSEG:%.consultar'),
  ('PSIC', 'documento-expediente.crear'), ('PSIC', 'documento-expediente.actualizar'),

  -- EDUC: talleres y asistencias
  ('EDUC', 'NOSEG:%.consultar'),
  ('EDUC', 'taller.%'), ('EDUC', 'asistencia-taller.%'),

  -- CONS: solo lectura para fiscalización
  ('CONS', 'NOSEG:%.consultar');

INSERT INTO seguridad.prms (prfl_id, accn_id, estado)
SELECT DISTINCT f.prfl_id, a.accn_id, 'V'
  FROM tmp_matriz m
  JOIN seguridad.prfl f ON f.prflcdgo = m.codigo
  JOIN seguridad.accn a
    ON a.accnnmbr LIKE REPLACE(m.patron, 'NOSEG:', '')
 WHERE m.patron NOT LIKE 'NOSEG:%'
    OR NOT EXISTS (
         SELECT 1 FROM tmp_recurso r
          WHERE r.es_seguridad AND a.accnnmbr LIKE r.recurso || '.%')
ON CONFLICT (prfl_id, accn_id) DO NOTHING;

COMMIT;

-- Resumen
SELECT f.prflcdgo AS perfil, COUNT(p.prms_id) AS permisos
  FROM seguridad.prfl f
  LEFT JOIN seguridad.prms p ON p.prfl_id = f.prfl_id AND p.estado = 'V'
 GROUP BY f.prfl_id, f.prflcdgo
 ORDER BY f.prfl_id;
