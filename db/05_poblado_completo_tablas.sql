-- ==============================================================================
-- SCRIPT DE POBLADO INTEGRAL: GARANTIZAR >= 3 REGISTROS EN TODAS LAS TABLAS
-- Sistema UZDI - Base de datos PostgreSQL
-- ==============================================================================
-- Orden estricto de precedencia:
-- 1. Tablas independientes de seguridad (prsn, prpf)
-- 2. Tablas independientes de contexto familiar (representante)
-- 3. Tablas dependientes de contexto familiar (adolescente_representante)
-- 4. Tablas dependientes de talleres (taller)
-- 5. Tablas dependientes de asistencia a talleres (asistencia_taller)
-- 6. Tablas dependientes de gestion documental (documento_expediente)
-- ==============================================================================

DO $$
DECLARE
    -- IDs de usuarios
    v_prsn_admin INT;
    v_prsn_juez INT;
    v_prsn_tsoc INT;
    v_prsn_psic INT;
    v_prsn_educ INT;

    -- Perfiles
    v_prfl_adm INT;
    v_prfl_juez INT;
    v_prfl_tsoc INT;
    v_prfl_psic INT;
    v_prfl_educ INT;

    -- Tipos de persona
    v_tppr_dir INT;
    v_tppr_psic INT;
    v_tppr_tsoc INT;
    v_tppr_educ INT;
    v_tppr_abog INT;

    -- Cantones
    v_cntn_quito INT := 1;
    v_cntn_guayaquil INT := 6;
    v_cntn_cuenca INT := 11;

    -- Representantes
    v_repr_1 INT;
    v_repr_2 INT;
    v_repr_3 INT;

    -- Adolescentes
    v_adlc_1 INT;
    v_adlc_2 INT;
    v_adlc_3 INT;

    -- Relaciones adre
    v_adre_1 INT;
    v_adre_2 INT;
    v_adre_3 INT;

    -- Expedientes
    v_expe_1 INT;
    v_expe_2 INT;
    v_expe_3 INT;

    -- Talleres
    v_tall_1 INT;
    v_tall_2 INT;
    v_tall_3 INT;

    -- Tipos de documento
    v_tpdc_1 INT;
    v_tpdc_2 INT;
    v_tpdc_3 INT;

BEGIN

    -- ==========================================================================
    -- 1. SEGURIDAD: USUARIOS (seguridad.prsn) Y PERFILES ASIGNADOS (seguridad.prpf)
    -- ==========================================================================
    SELECT prsn_id INTO v_prsn_admin FROM seguridad.prsn WHERE prsnlogn = 'admin';
    
    SELECT tppr_id INTO v_tppr_dir FROM seguridad.tipo_persona WHERE nombre ILIKE '%Director%' LIMIT 1;
    SELECT tppr_id INTO v_tppr_abog FROM seguridad.tipo_persona WHERE nombre ILIKE '%Abogado%' LIMIT 1;
    SELECT tppr_id INTO v_tppr_tsoc FROM seguridad.tipo_persona WHERE nombre ILIKE '%Trabajador Social%' LIMIT 1;
    SELECT tppr_id INTO v_tppr_psic FROM seguridad.tipo_persona WHERE nombre ILIKE '%Psicólogo%' LIMIT 1;
    SELECT tppr_id INTO v_tppr_educ FROM seguridad.tipo_persona WHERE nombre ILIKE '%Educador%' LIMIT 1;

    SELECT prfl_id INTO v_prfl_adm FROM seguridad.prfl WHERE prflcdgo = 'ADM';
    SELECT prfl_id INTO v_prfl_juez FROM seguridad.prfl WHERE prflcdgo = 'JUEZ';
    SELECT prfl_id INTO v_prfl_tsoc FROM seguridad.prfl WHERE prflcdgo = 'TSOC';
    SELECT prfl_id INTO v_prfl_psic FROM seguridad.prfl WHERE prflcdgo = 'PSIC';
    SELECT prfl_id INTO v_prfl_educ FROM seguridad.prfl WHERE prflcdgo = 'EDUC';

    -- Crear usuario Juez si no existe
    IF NOT EXISTS (SELECT 1 FROM seguridad.prsn WHERE prsnlogn = 'juez_uio') THEN
        INSERT INTO seguridad.prsn (tppr_id, prsnnmbr, prsnapll, prsnmail, prsnlogn, prsnpass, prsnobsr, estado)
        VALUES (COALESCE(v_tppr_abog, 1), 'Fernando', 'Alvarado Paz', 'juez@uzdi.local', 'juez_uio',
                '$2b$10$azqSM85gQLQGt7DU8HgL2OCjcuyyyqd01sFy0kdG25jNoBubwP/Uy', 'Juez de Familia y Niñez de Prueba', 'V')
        RETURNING prsn_id INTO v_prsn_juez;
    ELSE
        SELECT prsn_id INTO v_prsn_juez FROM seguridad.prsn WHERE prsnlogn = 'juez_uio';
    END IF;

    -- Crear usuario Trabajador Social si no existe
    IF NOT EXISTS (SELECT 1 FROM seguridad.prsn WHERE prsnlogn = 'tsoc_uio') THEN
        INSERT INTO seguridad.prsn (tppr_id, prsnnmbr, prsnapll, prsnmail, prsnlogn, prsnpass, prsnobsr, estado)
        VALUES (COALESCE(v_tppr_tsoc, 1), 'Elena', 'Mendoza Viteri', 'tsoc@uzdi.local', 'tsoc_uio',
                '$2b$10$azqSM85gQLQGt7DU8HgL2OCjcuyyyqd01sFy0kdG25jNoBubwP/Uy', 'Trabajadora Social de Prueba', 'V')
        RETURNING prsn_id INTO v_prsn_tsoc;
    ELSE
        SELECT prsn_id INTO v_prsn_tsoc FROM seguridad.prsn WHERE prsnlogn = 'tsoc_uio';
    END IF;

    -- Asignar perfiles en seguridad.prpf
    IF v_prfl_juez IS NOT NULL THEN
        INSERT INTO seguridad.prpf (prsn_id, prfl_id, estado)
        VALUES (v_prsn_juez, v_prfl_juez, 'V')
        ON CONFLICT (prsn_id, prfl_id) DO NOTHING;
    END IF;

    IF v_prfl_tsoc IS NOT NULL THEN
        INSERT INTO seguridad.prpf (prsn_id, prfl_id, estado)
        VALUES (v_prsn_tsoc, v_prfl_tsoc, 'V')
        ON CONFLICT (prsn_id, prfl_id) DO NOTHING;
    END IF;

    -- ==========================================================================
    -- 2. CONTEXTO FAMILIAR: REPRESENTANTES (contexto_familiar.representante)
    -- ==========================================================================
    IF NOT EXISTS (SELECT 1 FROM contexto_familiar.representante WHERE cedula = '1790000001') THEN
        INSERT INTO contexto_familiar.representante (
            cntn_id, nombre, apellido, cedula, telefono, direccion, estado, "fcCrea"
        ) VALUES (
            v_cntn_quito, 'Rosa Elena', 'Vega Cárdenas', '1790000001', '0991112233',
            'Av. Prensa y Florida, Quito', 'V', NOW()
        ) RETURNING repr_id INTO v_repr_1;
    ELSE
        SELECT repr_id INTO v_repr_1 FROM contexto_familiar.representante WHERE cedula = '1790000001';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM contexto_familiar.representante WHERE cedula = '0990000002') THEN
        INSERT INTO contexto_familiar.representante (
            cntn_id, nombre, apellido, cedula, telefono, direccion, estado, "fcCrea"
        ) VALUES (
            v_cntn_guayaquil, 'Segundo Manuel', 'Castillo Suárez', '0990000002', '0994445566',
            'Calle Portete y la 14, Guayaquil', 'V', NOW()
        ) RETURNING repr_id INTO v_repr_2;
    ELSE
        SELECT repr_id INTO v_repr_2 FROM contexto_familiar.representante WHERE cedula = '0990000002';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM contexto_familiar.representante WHERE cedula = '0190000003') THEN
        INSERT INTO contexto_familiar.representante (
            cntn_id, nombre, apellido, cedula, telefono, direccion, estado, "fcCrea"
        ) VALUES (
            v_cntn_cuenca, 'Gloria Patricia', 'Paredes Vintimilla', '0190000003', '0997778899',
            'Av. España y Huayna Cápac, Cuenca', 'V', NOW()
        ) RETURNING repr_id INTO v_repr_3;
    ELSE
        SELECT repr_id INTO v_repr_3 FROM contexto_familiar.representante WHERE cedula = '0190000003';
    END IF;

    -- ==========================================================================
    -- 3. VINCULACIÓN: ADOLESCENTE - REPRESENTANTE (contexto_familiar.adolescente_representante)
    -- ==========================================================================
    SELECT adlc_id INTO v_adlc_1 FROM adolescente.adolescente WHERE cedula = '0000000011' LIMIT 1;
    SELECT adlc_id INTO v_adlc_2 FROM adolescente.adolescente WHERE cedula = '0000000022' LIMIT 1;
    SELECT adlc_id INTO v_adlc_3 FROM adolescente.adolescente WHERE cedula = '0000000033' LIMIT 1;

    -- Si por alguna razón no los encuentra por cédula fija, tomar los 3 primeros
    IF v_adlc_1 IS NULL THEN
        SELECT adlc_id INTO v_adlc_1 FROM adolescente.adolescente ORDER BY adlc_id LIMIT 1 OFFSET 0;
        SELECT adlc_id INTO v_adlc_2 FROM adolescente.adolescente ORDER BY adlc_id LIMIT 1 OFFSET 1;
        SELECT adlc_id INTO v_adlc_3 FROM adolescente.adolescente ORDER BY adlc_id LIMIT 1 OFFSET 2;
    END IF;

    -- Vínculo 1: Madre (tprt_id = 1)
    IF NOT EXISTS (SELECT 1 FROM contexto_familiar.adolescente_representante WHERE adlc_id = v_adlc_1 AND repr_id = v_repr_1) THEN
        INSERT INTO contexto_familiar.adolescente_representante (
            adlc_id, repr_id, tprt_id, es_referente, fecha_inicio, estado, "fcCrea"
        ) VALUES (
            v_adlc_1, v_repr_1, 1, 'V', '2026-01-15', 'V', NOW()
        ) RETURNING adre_id INTO v_adre_1;
    ELSE
        SELECT adre_id INTO v_adre_1 FROM contexto_familiar.adolescente_representante WHERE adlc_id = v_adlc_1 AND repr_id = v_repr_1;
    END IF;

    -- Vínculo 2: Padre (tprt_id = 2)
    IF NOT EXISTS (SELECT 1 FROM contexto_familiar.adolescente_representante WHERE adlc_id = v_adlc_2 AND repr_id = v_repr_2) THEN
        INSERT INTO contexto_familiar.adolescente_representante (
            adlc_id, repr_id, tprt_id, es_referente, fecha_inicio, estado, "fcCrea"
        ) VALUES (
            v_adlc_2, v_repr_2, 2, 'V', '2026-02-01', 'V', NOW()
        ) RETURNING adre_id INTO v_adre_2;
    ELSE
        SELECT adre_id INTO v_adre_2 FROM contexto_familiar.adolescente_representante WHERE adlc_id = v_adlc_2 AND repr_id = v_repr_2;
    END IF;

    -- Vínculo 3: Madre (tprt_id = 1)
    IF NOT EXISTS (SELECT 1 FROM contexto_familiar.adolescente_representante WHERE adlc_id = v_adlc_3 AND repr_id = v_repr_3) THEN
        INSERT INTO contexto_familiar.adolescente_representante (
            adlc_id, repr_id, tprt_id, es_referente, fecha_inicio, estado, "fcCrea"
        ) VALUES (
            v_adlc_3, v_repr_3, 1, 'V', '2026-02-10', 'V', NOW()
        ) RETURNING adre_id INTO v_adre_3;
    ELSE
        SELECT adre_id INTO v_adre_3 FROM contexto_familiar.adolescente_representante WHERE adlc_id = v_adlc_3 AND repr_id = v_repr_3;
    END IF;

    -- ==========================================================================
    -- 4. TALLERES SOCIOEDUCATIVOS (talleres_actividades.taller)
    -- ==========================================================================
    IF NOT EXISTS (SELECT 1 FROM talleres_actividades.taller WHERE nombre = 'Taller de Habilidades para la Vida') THEN
        INSERT INTO talleres_actividades.taller (
            uzdi_id, prsn_id, nombre, tema, objetivo, fecha, hora_inicio, hora_fin, lugar, estado, "fcCrea"
        ) VALUES (
            1, v_prsn_admin, 'Taller de Habilidades para la Vida', 'Resolución pacífica de conflictos',
            'Desarrollar capacidades de comunicación asertiva y toma de decisiones',
            '2026-03-10', '09:00:00', '11:00:00', 'Aula Principal UZDI Pichincha', 'V', NOW()
        ) RETURNING tall_id INTO v_tall_1;
    ELSE
        SELECT tall_id INTO v_tall_1 FROM talleres_actividades.taller WHERE nombre = 'Taller de Habilidades para la Vida';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM talleres_actividades.taller WHERE nombre = 'Taller de Orientación Vocacional') THEN
        INSERT INTO talleres_actividades.taller (
            uzdi_id, prsn_id, nombre, tema, objetivo, fecha, hora_inicio, hora_fin, lugar, estado, "fcCrea"
        ) VALUES (
            3, v_prsn_admin, 'Taller de Orientación Vocacional', 'Proyecto de vida y empleo juvenil',
            'Construir un plan de metas personales y capacitación técnica',
            '2026-03-15', '14:00:00', '16:30:00', 'Salón de Actos UZDI Guayas', 'V', NOW()
        ) RETURNING tall_id INTO v_tall_2;
    ELSE
        SELECT tall_id INTO v_tall_2 FROM talleres_actividades.taller WHERE nombre = 'Taller de Orientación Vocacional';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM talleres_actividades.taller WHERE nombre = 'Taller de Prevención de Adicciones') THEN
        INSERT INTO talleres_actividades.taller (
            uzdi_id, prsn_id, nombre, tema, objetivo, fecha, hora_inicio, hora_fin, lugar, estado, "fcCrea"
        ) VALUES (
            4, v_prsn_admin, 'Taller de Prevención de Adicciones', 'Salud mental y factores protectores',
            'Identificar factores de riesgo y fortalecer redes de apoyo comunitario',
            '2026-03-20', '10:00:00', '12:00:00', 'Auditorio UZDI Azuay', 'V', NOW()
        ) RETURNING tall_id INTO v_tall_3;
    ELSE
        SELECT tall_id INTO v_tall_3 FROM talleres_actividades.taller WHERE nombre = 'Taller de Prevención de Adicciones';
    END IF;

    -- ==========================================================================
    -- 5. ASISTENCIA A TALLERES (talleres_actividades.asistencia_taller)
    -- ==========================================================================
    -- Asistencia 1: Adolescente 1 asistió a Taller 1
    IF NOT EXISTS (SELECT 1 FROM talleres_actividades.asistencia_taller WHERE tall_id = v_tall_1 AND adlc_id = v_adlc_1) THEN
        INSERT INTO talleres_actividades.asistencia_taller (
            tall_id, adlc_id, adre_id, tipo_asistente, asistio, observaciones, estado, "fcCrea"
        ) VALUES (
            v_tall_1, v_adlc_1, NULL, 'adolescente', 'V', 'Participación activa y puntual', 'V', NOW()
        );
    END IF;

    -- Asistencia 2: Adolescente 2 asistió a Taller 2
    IF NOT EXISTS (SELECT 1 FROM talleres_actividades.asistencia_taller WHERE tall_id = v_tall_2 AND adlc_id = v_adlc_2) THEN
        INSERT INTO talleres_actividades.asistencia_taller (
            tall_id, adlc_id, adre_id, tipo_asistente, asistio, observaciones, estado, "fcCrea"
        ) VALUES (
            v_tall_2, v_adlc_2, NULL, 'adolescente', 'V', 'Asistencia completa', 'V', NOW()
        );
    END IF;

    -- Asistencia 3: Representante 1 asistió a Taller 1
    IF NOT EXISTS (SELECT 1 FROM talleres_actividades.asistencia_taller WHERE tall_id = v_tall_1 AND adre_id = v_adre_1) THEN
        INSERT INTO talleres_actividades.asistencia_taller (
            tall_id, adlc_id, adre_id, tipo_asistente, asistio, observaciones, estado, "fcCrea"
        ) VALUES (
            v_tall_1, NULL, v_adre_1, 'representante', 'V', 'Madre acude a taller para familias', 'V', NOW()
        );
    END IF;

    -- ==========================================================================
    -- 6. GESTIÓN DOCUMENTAL: DOCUMENTOS DE EXPEDIENTE (gestion_documental.documento_expediente)
    -- ==========================================================================
    SELECT expe_id INTO v_expe_1 FROM adolescente.expediente ORDER BY expe_id LIMIT 1 OFFSET 0;
    SELECT expe_id INTO v_expe_2 FROM adolescente.expediente ORDER BY expe_id LIMIT 1 OFFSET 1;
    SELECT expe_id INTO v_expe_3 FROM adolescente.expediente ORDER BY expe_id LIMIT 1 OFFSET 2;

    SELECT tpdc_id INTO v_tpdc_1 FROM gestion_documental.tipo_documento LIMIT 1 OFFSET 0;
    SELECT tpdc_id INTO v_tpdc_2 FROM gestion_documental.tipo_documento LIMIT 1 OFFSET 1;
    SELECT tpdc_id INTO v_tpdc_3 FROM gestion_documental.tipo_documento LIMIT 1 OFFSET 2;

    -- Documento 1: Sentencia / Resolución judicial (Expediente 1)
    IF NOT EXISTS (SELECT 1 FROM gestion_documental.documento_expediente WHERE expe_id = v_expe_1 AND numero_documento = 'RES-JUD-2026-001') THEN
        INSERT INTO gestion_documental.documento_expediente (
            expe_id, prsn_id, tpdc_id, es_habilitante, estado_tramite, numero_documento,
            fecha_documento, emisor, observaciones, estado, "fcCrea"
        ) VALUES (
            v_expe_1, v_prsn_admin, v_tpdc_1, 'V', 'verificado', 'RES-JUD-2026-001',
            '2026-01-14', 'Unidad Judicial de Familia y Niñez Pichincha',
            'Sentencia condenatoria con medida no privativa', 'V', NOW()
        );
    END IF;

    -- Documento 2: Informe Psicosocial inicial (Expediente 2)
    IF NOT EXISTS (SELECT 1 FROM gestion_documental.documento_expediente WHERE expe_id = v_expe_2 AND numero_documento = 'INF-SOC-2026-002') THEN
        INSERT INTO gestion_documental.documento_expediente (
            expe_id, prsn_id, tpdc_id, es_habilitante, estado_tramite, numero_documento,
            fecha_documento, emisor, observaciones, estado, "fcCrea"
        ) VALUES (
            v_expe_2, v_prsn_admin, v_tpdc_2, 'F', 'recibido', 'INF-SOC-2026-002',
            '2026-02-02', 'Equipo Técnico UZDI Guayas',
            'Evaluación sociofamiliar inicial y propuesta de intervención', 'V', NOW()
        );
    END IF;

    -- Documento 3: Plan Individual de Cumplimiento (Expediente 3)
    IF NOT EXISTS (SELECT 1 FROM gestion_documental.documento_expediente WHERE expe_id = v_expe_3 AND numero_documento = 'PIC-UZDI-2026-003') THEN
        INSERT INTO gestion_documental.documento_expediente (
            expe_id, prsn_id, tpdc_id, es_habilitante, estado_tramite, numero_documento,
            fecha_documento, emisor, observaciones, estado, "fcCrea"
        ) VALUES (
            v_expe_3, v_prsn_admin, v_tpdc_3, 'V', 'recibido', 'PIC-UZDI-2026-003',
            '2026-02-12', 'Coordinación Técnica UZDI Azuay',
            'Cronograma acordado de talleres y medidas socioeducativas', 'V', NOW()
        );
    END IF;

END $$;
