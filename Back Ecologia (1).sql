-- ============================================================
-- DDL PostgreSQL - Sistema SNAI / UZDI (Versión 8)
-- Proyecto: Sistema de Gestión Integral UZDI (SNAI - PUCE)
-- Motor objetivo: PostgreSQL 14+
-- 
-- Cambios respecto a Versión 7:
-- 1) Se agrega la tabla detalle adolescente.medida_expediente con 
--    el atributo obligatorio 'orden' para permitir 1 o más medidas 
--    por expediente (consecutivas/simultáneas según el CONA).
-- 2) Se desacopla mdso_id de adolescente.expediente para que la
--    relación se gestione mediante adolescente.medida_expediente.
--    Se incorpora el campo numero_causa en expediente.
-- 3) Se mantiene el campo cedula VARCHAR(20) en adolescente.adolescente
--    para ingreso indistinto de cédula o pasaporte.
-- 4) Se incorpora el campo 'estado' CHAR(1) NOT NULL DEFAULT 'V'
--    con validación CHECK ('V', 'F') en todas las tablas para
--    estandarizar el borrado lógico y el soporte a BooleanVF.
-- 5) Se mantienen todos los esquemas y tablas (incluyendo seguridad.accn,
--    seguridad.prms, seguridad.sesn y seguridad.historial).
-- ============================================================

-- ============================================================
-- 1. CREACIÓN DE ESQUEMAS
-- ============================================================
CREATE SCHEMA IF NOT EXISTS estructura_institucional;
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS adolescente;
CREATE SCHEMA IF NOT EXISTS contexto_familiar;
CREATE SCHEMA IF NOT EXISTS talleres_actividades;
CREATE SCHEMA IF NOT EXISTS gestion_documental;

-- ============================================================
-- 2. FUNCIONES GENERALES Y TRIGGERS DE AUDITORÍA
-- ============================================================

-- Función para actualizar automáticamente la marca de tiempo fcMod
CREATE OR REPLACE FUNCTION seguridad.fn_actualizar_fcmod() 
RETURNS TRIGGER AS $$
BEGIN 
    NEW."fcMod" = NOW(); 
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

-- Función de auditoría inmutable en seguridad.historial
CREATE OR REPLACE FUNCTION seguridad.fn_registrar_historial() 
RETURNS TRIGGER AS $$
DECLARE 
    v_registro_id INT4; 
    v_usuario_id  INT4; 
BEGIN 
    -- Captura del usuario inyectado desde NestJS mediante SET LOCAL app.usuario_id
    BEGIN 
        v_usuario_id := NULLIF(current_setting('app.usuario_id', true), '')::INT4; 
    EXCEPTION WHEN OTHERS THEN 
        v_usuario_id := NULL; 
    END;

    -- Obtención dinámica del identificador primario afectado
    IF TG_OP = 'DELETE' THEN
        SELECT value::INT4
        INTO v_registro_id
        FROM jsonb_each_text(to_jsonb(OLD))
        WHERE key LIKE '%_id'
        LIMIT 1;
    ELSE
        SELECT value::INT4
        INTO v_registro_id
        FROM jsonb_each_text(to_jsonb(NEW))
        WHERE key LIKE '%_id'
        LIMIT 1;
    END IF;

    -- Inserción del evento de auditoría
    INSERT INTO seguridad.historial (
        tabla_afectada,
        registro_id,
        usua_id,
        fecha,
        accion,
        estado_anterior,
        estado_nuevo,
        descripcion
    )
    VALUES (
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        COALESCE(v_registro_id, 0),
        COALESCE(v_usuario_id, 0),
        NOW(),
        TG_OP,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD)::TEXT ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW)::TEXT ELSE NULL END,
        'Registro automático generado por trigger transaccional'
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. MÓDULO: ESTRUCTURA INSTITUCIONAL
-- ============================================================

CREATE TABLE estructura_institucional.provincia (
    prov_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_provincia_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE estructura_institucional.canton (
    cntn_id SERIAL PRIMARY KEY,
    prov_id INT4 NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_canton_provincia FOREIGN KEY (prov_id) 
        REFERENCES estructura_institucional.provincia(prov_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_canton_provincia_nombre UNIQUE (prov_id, nombre),
    CONSTRAINT chk_canton_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE estructura_institucional.uzdi (
    uzdi_id SERIAL PRIMARY KEY,
    cntn_id INT4 NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    zona VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_uzdi_canton FOREIGN KEY (cntn_id) 
        REFERENCES estructura_institucional.canton(cntn_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_uzdi_estado CHECK (estado IN ('V', 'F'))
);

-- ============================================================
-- 4. MÓDULO: SEGURIDAD
-- ============================================================

CREATE TABLE seguridad.prfl (
    prfl_id SERIAL PRIMARY KEY,
    prflpdre INT4,
    prflcdgo VARCHAR(5),
    prflnmbr VARCHAR(63) NOT NULL,
    prfldscr VARCHAR(63),
    prflobsr VARCHAR(127),
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_prfl_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE seguridad.accn (
    accn_id SERIAL PRIMARY KEY,
    ctrl_id INT4,
    mdlo_id INT4,
    tpac_id INT4,
    accnnmbr VARCHAR(63) NOT NULL,
    accndscr VARCHAR(63),
    accnaudt INT2,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_accn_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE seguridad.prms (
    prms_id SERIAL PRIMARY KEY,
    prfl_id INT4 NOT NULL,
    accn_id INT4 NOT NULL,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_prms_prfl FOREIGN KEY (prfl_id) 
        REFERENCES seguridad.prfl(prfl_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_prms_accn FOREIGN KEY (accn_id) 
        REFERENCES seguridad.accn(accn_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_prms_prfl_accn UNIQUE (prfl_id, accn_id),
    CONSTRAINT chk_prms_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE seguridad.tipo_persona (
    tppr_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_tipo_persona_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE seguridad.prsn (
    prsn_id SERIAL PRIMARY KEY,
    uzdi_id INT4 NULL,
    tppr_id INT4 NULL,
    prsnnmbr VARCHAR(31) NOT NULL,
    prsnapll VARCHAR(31) NOT NULL,
    prsnsexo CHAR(1),
    prsndire VARCHAR(255),
    prsntelf VARCHAR(63),
    prsnmail VARCHAR(63),
    prsnlogn VARCHAR(30) UNIQUE NOT NULL,
    prsnpass VARCHAR(63) NOT NULL,
    prsnobsr VARCHAR(255),
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_prsn_uzdi FOREIGN KEY (uzdi_id) 
        REFERENCES estructura_institucional.uzdi(uzdi_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_prsn_tipo_persona FOREIGN KEY (tppr_id) 
        REFERENCES seguridad.tipo_persona(tppr_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_prsn_sexo CHECK (prsnsexo IN ('M', 'F', 'O')),
    CONSTRAINT chk_prsn_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE seguridad.sesn (
    sesn_id SERIAL PRIMARY KEY,
    prpf_id INT4,
    prfl_id INT4 NOT NULL,
    prsn_id INT4 NOT NULL,
    sesnfcin TIMESTAMP NOT NULL DEFAULT NOW(),
    sesnfcfn TIMESTAMP,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    CONSTRAINT fk_sesn_prfl FOREIGN KEY (prfl_id) 
        REFERENCES seguridad.prfl(prfl_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sesn_prsn FOREIGN KEY (prsn_id) 
        REFERENCES seguridad.prsn(prsn_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_sesn_estado CHECK (estado IN ('V', 'F'))
);

-- Tabla de auditoría inmutable (se alimenta por triggers, sin FKs para máxima integridad histórica)
CREATE TABLE seguridad.historial (
    hist_id SERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id INT4 NOT NULL,
    usua_id INT4 NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    accion VARCHAR(100) NOT NULL,
    estado_anterior TEXT,
    estado_nuevo TEXT,
    descripcion TEXT
);

-- ============================================================
-- 5. MÓDULO: ADOLESCENTE
-- ============================================================

CREATE TABLE adolescente.nacionalidad (
    nacn_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_nacionalidad_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE adolescente.estado_civil (
    etcv_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_estado_civil_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE adolescente.etnia (
    etna_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_etnia_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE adolescente.gdo (
    gdo_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_gdo_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE adolescente.infraccion (
    infc_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(127) NOT NULL,
    articulo_cona VARCHAR(50),
    descripcion TEXT,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_infraccion_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE adolescente.medida_socioeducativa (
    mdso_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    duracion_meses INT2,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_medida_duracion_meses CHECK (duracion_meses IS NULL OR duracion_meses > 0),
    CONSTRAINT chk_medida_estado CHECK (estado IN ('V', 'F'))
);

-- Tabla principal de Adolescente: conserva 'cedula' para cédula ecuatoriana o pasaporte extranjero
CREATE TABLE adolescente.adolescente (
    adlc_id SERIAL PRIMARY KEY,
    nacn_id INT4 NOT NULL,
    etcv_id INT4 NOT NULL,
    etna_id INT4 NOT NULL,
    cntn_id INT4 NOT NULL,
    gdo_id INT4 NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL, -- Admite cédula (10 dígitos) o pasaporte internacional
    fecha_nac DATE NOT NULL,
    sexo CHAR(1) NOT NULL,
    nved_nombre VARCHAR(100),
    hijos INT2 DEFAULT 0,
    reincide CHAR(1) NOT NULL DEFAULT 'F',
    fecha_ingr DATE NOT NULL,
    "hijoPpl" CHAR(1) NOT NULL DEFAULT 'F',
    observaciones VARCHAR(255),
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_adolescente_nacionalidad FOREIGN KEY (nacn_id) 
        REFERENCES adolescente.nacionalidad(nacn_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_adolescente_estado_civil FOREIGN KEY (etcv_id) 
        REFERENCES adolescente.estado_civil(etcv_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_adolescente_etnia FOREIGN KEY (etna_id) 
        REFERENCES adolescente.etnia(etna_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_adolescente_canton FOREIGN KEY (cntn_id) 
        REFERENCES estructura_institucional.canton(cntn_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_adolescente_gdo FOREIGN KEY (gdo_id) 
        REFERENCES adolescente.gdo(gdo_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_adolescente_sexo CHECK (sexo IN ('M', 'F', 'O')),
    CONSTRAINT chk_adolescente_hijos CHECK (hijos >= 0),
    CONSTRAINT chk_adolescente_reincide CHECK (reincide IN ('V', 'F')),
    CONSTRAINT chk_adolescente_hijoppl CHECK ("hijoPpl" IN ('V', 'F')),
    CONSTRAINT chk_adolescente_estado CHECK (estado IN ('V', 'F'))
);

-- Tabla de Expediente judicial procesal (desacoplada de medida individual)
CREATE TABLE adolescente.expediente (
    expe_id SERIAL PRIMARY KEY,
    adlc_id INT4 NOT NULL,
    uzdi_id INT4 NOT NULL,
    infc_id INT4 NOT NULL,
    numero_causa VARCHAR(100), -- Nro. de causa judicial / expediente (ej. EXP-2026-0042)
    estado_procesal VARCHAR(50) NOT NULL DEFAULT 'En proceso',
    observaciones TEXT,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_expediente_adolescente FOREIGN KEY (adlc_id) 
        REFERENCES adolescente.adolescente(adlc_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_expediente_uzdi FOREIGN KEY (uzdi_id) 
        REFERENCES estructura_institucional.uzdi(uzdi_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_expediente_infraccion FOREIGN KEY (infc_id) 
        REFERENCES adolescente.infraccion(infc_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_expediente_estado_procesal CHECK (estado_procesal IN ('En proceso', 'Atraso', 'Incomparecencia', 'Concluido', 'Archivado')),
    CONSTRAINT chk_expediente_estado CHECK (estado IN ('V', 'F'))
);

-- NUEVA TABLA v8: Detalle de Medidas por Expediente (Normativa CONA: Medidas simultáneas o consecutivas)
CREATE TABLE adolescente.medida_expediente (
    mdex_id SERIAL PRIMARY KEY,
    expe_id INT4 NOT NULL,
    mdso_id INT4 NOT NULL,
    orden INT4 NOT NULL, -- Obligatorio: secuencia cronológica/precedencia de cumplimiento (1, 2, 3...)
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado_cumplimiento VARCHAR(50) NOT NULL DEFAULT 'En proceso',
    observaciones TEXT,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_mdex_expediente FOREIGN KEY (expe_id) 
        REFERENCES adolescente.expediente(expe_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_mdex_medida FOREIGN KEY (mdso_id) 
        REFERENCES adolescente.medida_socioeducativa(mdso_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_mdex_orden CHECK (orden > 0),
    CONSTRAINT chk_mdex_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
    CONSTRAINT chk_mdex_cumplimiento CHECK (estado_cumplimiento IN ('En proceso', 'Cumplida', 'Incumplida', 'Sustituida', 'Suspendida')),
    CONSTRAINT chk_mdex_estado CHECK (estado IN ('V', 'F'))
);

-- ============================================================
-- 6. MÓDULO: CONTEXTO FAMILIAR
-- ============================================================

CREATE TABLE contexto_familiar.tipo_parentesco (
    tprt_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_tipo_parentesco_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE contexto_familiar.representante (
    repr_id SERIAL PRIMARY KEY,
    cntn_id INT4 NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_representante_canton FOREIGN KEY (cntn_id) 
        REFERENCES estructura_institucional.canton(cntn_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_representante_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE contexto_familiar.adolescente_representante (
    adre_id SERIAL PRIMARY KEY,
    adlc_id INT4 NOT NULL,
    repr_id INT4 NOT NULL,
    tprt_id INT4 NOT NULL,
    es_referente CHAR(1) NOT NULL DEFAULT 'F',
    fecha_inicio DATE,
    fecha_fin DATE,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_adolescente_representante_adolescente FOREIGN KEY (adlc_id) 
        REFERENCES adolescente.adolescente(adlc_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_adolescente_representante_representante FOREIGN KEY (repr_id) 
        REFERENCES contexto_familiar.representante(repr_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_adolescente_representante_tipo_parentesco FOREIGN KEY (tprt_id) 
        REFERENCES contexto_familiar.tipo_parentesco(tprt_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_adolescente_representante UNIQUE (adlc_id, repr_id),
    CONSTRAINT chk_adre_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
    CONSTRAINT chk_adre_es_referente CHECK (es_referente IN ('V', 'F')),
    CONSTRAINT chk_adre_estado CHECK (estado IN ('V', 'F'))
);

-- ============================================================
-- 7. MÓDULO: TALLERES Y ACTIVIDADES
-- ============================================================

CREATE TABLE talleres_actividades.taller (
    tall_id SERIAL PRIMARY KEY,
    uzdi_id INT4 NOT NULL,
    prsn_id INT4 NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tema VARCHAR(255) NOT NULL,
    objetivo TEXT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    lugar VARCHAR(255),
    observaciones TEXT,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_taller_uzdi FOREIGN KEY (uzdi_id) 
        REFERENCES estructura_institucional.uzdi(uzdi_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_taller_prsn FOREIGN KEY (prsn_id) 
        REFERENCES seguridad.prsn(prsn_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_taller_horas CHECK (hora_fin > hora_inicio),
    CONSTRAINT chk_taller_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE talleres_actividades.asistencia_taller (
    asta_id SERIAL PRIMARY KEY,
    tall_id INT4 NOT NULL,
    adlc_id INT4 NULL,
    adre_id INT4 NULL,
    tipo_asistente VARCHAR(50) NOT NULL,
    asistio CHAR(1) NOT NULL DEFAULT 'F',
    observaciones TEXT,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_asistencia_taller_taller FOREIGN KEY (tall_id) 
        REFERENCES talleres_actividades.taller(tall_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_asistencia_taller_adolescente FOREIGN KEY (adlc_id) 
        REFERENCES adolescente.adolescente(adlc_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_asistencia_taller_adolescente_representante FOREIGN KEY (adre_id) 
        REFERENCES contexto_familiar.adolescente_representante(adre_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_asistencia_taller_asistente CHECK ( 
        (adlc_id IS NOT NULL AND adre_id IS NULL AND tipo_asistente = 'adolescente') OR 
        (adlc_id IS NULL AND adre_id IS NOT NULL AND tipo_asistente = 'representante') 
    ),
    CONSTRAINT chk_asistencia_taller_asistio CHECK (asistio IN ('V', 'F')),
    CONSTRAINT chk_asistencia_taller_estado CHECK (estado IN ('V', 'F'))
);

-- ============================================================
-- 8. MÓDULO: GESTIÓN DOCUMENTAL
-- ============================================================

CREATE TABLE gestion_documental.tipo_documento (
    tpdc_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    estado CHAR(1) NOT NULL DEFAULT 'V',
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_tipo_documento_estado CHECK (estado IN ('V', 'F'))
);

CREATE TABLE gestion_documental.documento_expediente (
    dcex_id SERIAL PRIMARY KEY,
    expe_id INT4 NOT NULL,
    prsn_id INT4 NOT NULL,
    tpdc_id INT4 NOT NULL,
    es_habilitante CHAR(1) NOT NULL DEFAULT 'F',
    estado_tramite VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- Estado del flujo documental
    numero_documento VARCHAR(100),
    fecha_documento DATE,
    emisor VARCHAR(255),
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    estado CHAR(1) NOT NULL DEFAULT 'V', -- Borrado lógico (V = Vigente, F = Eliminado lógicamente)
    "fcCrea" TIMESTAMP DEFAULT NOW(),
    "fcMod" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_documento_expediente_expediente FOREIGN KEY (expe_id) 
        REFERENCES adolescente.expediente(expe_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_documento_expediente_prsn FOREIGN KEY (prsn_id) 
        REFERENCES seguridad.prsn(prsn_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_documento_expediente_tipo FOREIGN KEY (tpdc_id) 
        REFERENCES gestion_documental.tipo_documento(tpdc_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_documento_estado_tramite CHECK (estado_tramite IN ('pendiente', 'recibido', 'verificado', 'no aplica', 'rechazado')),
    CONSTRAINT chk_documento_es_habilitante CHECK (es_habilitante IN ('V', 'F')),
    CONSTRAINT chk_documento_expediente_estado CHECK (estado IN ('V', 'F'))
);

-- ============================================================
-- 9. ÍNDICES DE RENDIMIENTO Y CLAVES FORÁNEAS
-- ============================================================

CREATE INDEX idx_canton_prov_id ON estructura_institucional.canton(prov_id);
CREATE INDEX idx_uzdi_cntn_id ON estructura_institucional.uzdi(cntn_id);

CREATE INDEX idx_prsn_logn ON seguridad.prsn(prsnlogn);
CREATE INDEX idx_prsn_uzdi_id ON seguridad.prsn(uzdi_id);
CREATE INDEX idx_prsn_tppr_id ON seguridad.prsn(tppr_id);
CREATE INDEX idx_sesn_prsn_id ON seguridad.sesn(prsn_id);
CREATE INDEX idx_sesn_prfl_id ON seguridad.sesn(prfl_id);
CREATE INDEX idx_prms_prfl_id ON seguridad.prms(prfl_id);
CREATE INDEX idx_prms_accn_id ON seguridad.prms(accn_id);
CREATE INDEX idx_historial_tabla_registro ON seguridad.historial(tabla_afectada, registro_id);
CREATE INDEX idx_historial_fecha ON seguridad.historial(fecha);

CREATE INDEX idx_adolescente_cedula ON adolescente.adolescente(cedula);
CREATE INDEX idx_adolescente_canton ON adolescente.adolescente(cntn_id);
CREATE INDEX idx_expediente_adlc_id ON adolescente.expediente(adlc_id);
CREATE INDEX idx_expediente_uzdi_id ON adolescente.expediente(uzdi_id);
CREATE INDEX idx_expediente_infc_id ON adolescente.expediente(infc_id);

-- Índices específicos para la tabla asociativa de medidas
CREATE INDEX idx_mdex_expe_id ON adolescente.medida_expediente(expe_id);
CREATE INDEX idx_mdex_mdso_id ON adolescente.medida_expediente(mdso_id);
CREATE INDEX idx_mdex_expe_orden ON adolescente.medida_expediente(expe_id, orden);

CREATE INDEX idx_representante_cedula ON contexto_familiar.representante(cedula);
CREATE INDEX idx_adre_adlc_id ON contexto_familiar.adolescente_representante(adlc_id);
CREATE INDEX idx_adre_repr_id ON contexto_familiar.adolescente_representante(repr_id);

CREATE INDEX idx_taller_uzdi_fecha ON talleres_actividades.taller(uzdi_id, fecha);
CREATE INDEX idx_asistencia_taller_tall_id ON talleres_actividades.asistencia_taller(tall_id);
CREATE INDEX idx_asistencia_taller_adlc_id ON talleres_actividades.asistencia_taller(adlc_id);
CREATE INDEX idx_asistencia_taller_adre_id ON talleres_actividades.asistencia_taller(adre_id);

CREATE INDEX idx_documento_expediente_expe_id ON gestion_documental.documento_expediente(expe_id);
CREATE INDEX idx_documento_expediente_tpdc_id ON gestion_documental.documento_expediente(tpdc_id);
CREATE INDEX idx_documento_expediente_prsn_id ON gestion_documental.documento_expediente(prsn_id);

-- ============================================================
-- 10. TRIGGERS AUTOMÁTICOS (fcMod y seguridad.historial)
-- ============================================================

-- Triggers de actualización de marca de tiempo (fcMod)
CREATE TRIGGER trg_fcmod_provincia BEFORE UPDATE ON estructura_institucional.provincia FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_canton BEFORE UPDATE ON estructura_institucional.canton FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_uzdi BEFORE UPDATE ON estructura_institucional.uzdi FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_prfl BEFORE UPDATE ON seguridad.prfl FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_accn BEFORE UPDATE ON seguridad.accn FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_prms BEFORE UPDATE ON seguridad.prms FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_tipo_persona BEFORE UPDATE ON seguridad.tipo_persona FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_prsn BEFORE UPDATE ON seguridad.prsn FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_nacionalidad BEFORE UPDATE ON adolescente.nacionalidad FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_estado_civil BEFORE UPDATE ON adolescente.estado_civil FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_etnia BEFORE UPDATE ON adolescente.etnia FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_gdo BEFORE UPDATE ON adolescente.gdo FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_infraccion BEFORE UPDATE ON adolescente.infraccion FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_medida_socioeducativa BEFORE UPDATE ON adolescente.medida_socioeducativa FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_adolescente BEFORE UPDATE ON adolescente.adolescente FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_expediente BEFORE UPDATE ON adolescente.expediente FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_medida_expediente BEFORE UPDATE ON adolescente.medida_expediente FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_tipo_parentesco BEFORE UPDATE ON contexto_familiar.tipo_parentesco FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_representante BEFORE UPDATE ON contexto_familiar.representante FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_adolescente_representante BEFORE UPDATE ON contexto_familiar.adolescente_representante FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_taller BEFORE UPDATE ON talleres_actividades.taller FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_asistencia_taller BEFORE UPDATE ON talleres_actividades.asistencia_taller FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_tipo_documento BEFORE UPDATE ON gestion_documental.tipo_documento FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();
CREATE TRIGGER trg_fcmod_documento_expediente BEFORE UPDATE ON gestion_documental.documento_expediente FOR EACH ROW EXECUTE FUNCTION seguridad.fn_actualizar_fcmod();

-- Triggers transaccionales de auditoría en seguridad.historial
CREATE TRIGGER trg_historial_provincia AFTER INSERT OR UPDATE OR DELETE ON estructura_institucional.provincia FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_canton AFTER INSERT OR UPDATE OR DELETE ON estructura_institucional.canton FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_uzdi AFTER INSERT OR UPDATE OR DELETE ON estructura_institucional.uzdi FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_prfl AFTER INSERT OR UPDATE OR DELETE ON seguridad.prfl FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_accn AFTER INSERT OR UPDATE OR DELETE ON seguridad.accn FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_prms AFTER INSERT OR UPDATE OR DELETE ON seguridad.prms FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_tipo_persona AFTER INSERT OR UPDATE OR DELETE ON seguridad.tipo_persona FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_prsn AFTER INSERT OR UPDATE OR DELETE ON seguridad.prsn FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_sesn AFTER INSERT OR UPDATE OR DELETE ON seguridad.sesn FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_nacionalidad AFTER INSERT OR UPDATE OR DELETE ON adolescente.nacionalidad FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_estado_civil AFTER INSERT OR UPDATE OR DELETE ON adolescente.estado_civil FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_etnia AFTER INSERT OR UPDATE OR DELETE ON adolescente.etnia FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_gdo AFTER INSERT OR UPDATE OR DELETE ON adolescente.gdo FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_infraccion AFTER INSERT OR UPDATE OR DELETE ON adolescente.infraccion FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_medida_socioeducativa AFTER INSERT OR UPDATE OR DELETE ON adolescente.medida_socioeducativa FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_adolescente AFTER INSERT OR UPDATE OR DELETE ON adolescente.adolescente FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_expediente AFTER INSERT OR UPDATE OR DELETE ON adolescente.expediente FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_medida_expediente AFTER INSERT OR UPDATE OR DELETE ON adolescente.medida_expediente FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_tipo_parentesco AFTER INSERT OR UPDATE OR DELETE ON contexto_familiar.tipo_parentesco FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_representante AFTER INSERT OR UPDATE OR DELETE ON contexto_familiar.representante FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_adolescente_representante AFTER INSERT OR UPDATE OR DELETE ON contexto_familiar.adolescente_representante FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_taller AFTER INSERT OR UPDATE OR DELETE ON talleres_actividades.taller FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_asistencia_taller AFTER INSERT OR UPDATE OR DELETE ON talleres_actividades.asistencia_taller FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_tipo_documento AFTER INSERT OR UPDATE OR DELETE ON gestion_documental.tipo_documento FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();
CREATE TRIGGER trg_historial_documento_expediente AFTER INSERT OR UPDATE OR DELETE ON gestion_documental.documento_expediente FOR EACH ROW EXECUTE FUNCTION seguridad.fn_registrar_historial();

-- ============================================================
-- 11. PARAMETRIZACIÓN INICIAL (CATÁLOGOS BASE / SEEDERS)
-- ============================================================

-- Catálogo de Tipos de Persona (seguridad.tipo_persona)
INSERT INTO seguridad.tipo_persona (nombre, estado) VALUES 
('Técnico', 'V'), 
('Coordinador', 'V'), 
('Administrativo', 'V'), 
('Director', 'V'), 
('Otro', 'V')
ON CONFLICT (nombre) DO NOTHING;

-- Catálogo de Perfiles Institucionales (seguridad.prfl)
INSERT INTO seguridad.prfl (prfl_id, prflcdgo, prflnmbr, prfldscr, estado) VALUES 
(1, 'ADM', 'Administrador', 'Gestión total y administración del sistema', 'V'),
(2, 'CORD', 'Coordinador UZDI', 'Supervisión y control de expedientes zonales', 'V'),
(3, 'LEGAL', 'Profesional Legal', 'Gestión judicial, expedientes y medidas', 'V'),
(4, 'TSOC', 'Trabajador/a Social', 'Entorno familiar, visitas y representantes', 'V'),
(5, 'PSIC', 'Psicólogo/a', 'Seguimiento psicológico y fichas técnicas', 'V'),
(6, 'EDUC', 'Educador/a', 'Talleres formativos y asistencias grupales', 'V'),
(7, 'CONS', 'Consulta', 'Acceso de solo lectura para fiscalización', 'V')
ON CONFLICT (prfl_id) DO NOTHING;
SELECT setval('seguridad.prfl_prfl_id_seq', (SELECT MAX(prfl_id) FROM seguridad.prfl));

-- Catálogo de Tipos de Parentesco (contexto_familiar.tipo_parentesco)
INSERT INTO contexto_familiar.tipo_parentesco (nombre, estado) VALUES 
('Madre', 'V'), 
('Padre', 'V'), 
('Abuela/o', 'V'), 
('Tía/o', 'V'), 
('Hermana/o', 'V'), 
('Cónyuge/Pareja', 'V'), 
('Tutor legal', 'V'), 
('Otro', 'V')
ON CONFLICT (nombre) DO NOTHING;

-- Catálogo de Tipos de Documento (gestion_documental.tipo_documento)
INSERT INTO gestion_documental.tipo_documento (nombre, descripcion, estado) VALUES 
('Oficio judicial', 'Notificaciones de juzgados o fiscalía', 'V'), 
('Acta de comparecencia', 'Constancia de presencia física del adolescente', 'V'), 
('Ficha de recepción', 'Documento de ingreso inicial a la UZDI', 'V'), 
('Informe técnico', 'Evaluación psicosocial o de avance socioeducativo', 'V'), 
('Resolución judicial', 'Sentencia que impone o sustituye medidas', 'V'), 
('Certificado médico', 'Valoración de salud general o psicológica', 'V'), 
('Certificado educativo', 'Constancia de matrícula o asistencia escolar', 'V'), 
('Otro', 'Documentos varios de soporte procesal', 'V')
ON CONFLICT (nombre) DO NOTHING;

-- Catálogo de Estados Civiles (adolescente.estado_civil)
INSERT INTO adolescente.estado_civil (nombre, estado) VALUES 
('Soltero/a', 'V'),
('Casado/a', 'V'),
('Unión de hecho', 'V'),
('Divorciado/a', 'V'),
('Viudo/a', 'V')
ON CONFLICT (nombre) DO NOTHING;

-- Catálogo de Etnias (adolescente.etnia)
INSERT INTO adolescente.etnia (nombre, estado) VALUES 
('Mestizo/a', 'V'),
('Indígena', 'V'),
('Afroecuatoriano/a', 'V'),
('Blanco/a', 'V'),
('Montubio/a', 'V'),
('Otro/a', 'V')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- FIN DEL SCRIPT DDL v8 UNIFICADO
-- ============================================================
