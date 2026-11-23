-- ==============================================================================
-- SEED DE DATOS DE PRUEBA OPERACIONALES (5 ADOLESCENTES, EXPEDIENTES Y MEDIDAS)
-- Sistema UZDI - Entorno de Pruebas y Presentación Frontend
-- ==============================================================================
-- Idempotente: Solo inserta si no existen las cédulas de prueba especificadas.
-- En DDL v8: 
--   estado: 'V' / 'F'
--   reincide: 'V' / 'F'
--   hijoPpl: 'V' / 'F'

DO $$
DECLARE
    v_cntn_quito INT := 1;
    v_cntn_guayaquil INT := 6;
    v_cntn_cuenca INT := 11;
    v_cntn_ambato INT := 16;
    v_cntn_ibarra INT := 21;

    v_adlc_1 INT;
    v_adlc_2 INT;
    v_adlc_3 INT;
    v_adlc_4 INT;
    v_adlc_5 INT;

    v_expe_1 INT;
    v_expe_2 INT;
    v_expe_3 INT;
    v_expe_4 INT;
    v_expe_5 INT;
BEGIN

    -- ==========================================================================
    -- 1. ADOLESCENTES DE PRUEBA (Cédulas ficticias '0000000011' a '0000000055')
    -- ==========================================================================

    -- 1. ADOLESCENTE 1 (Quito / UZDI Pichincha Norte)
    IF NOT EXISTS (SELECT 1 FROM adolescente.adolescente WHERE cedula = '0000000011') THEN
        INSERT INTO adolescente.adolescente (
            nacn_id, etcv_id, etna_id, cntn_id, gdo_id,
            nombre, apellido, cedula, fecha_nac, sexo,
            nved_nombre, hijos, reincide, fecha_ingr, "hijoPpl",
            observaciones, estado, "fcCrea"
        ) VALUES (
            1, 1, 1, v_cntn_quito, 1,
            'Juan Carlos (Prueba)', 'Morales Vega', '0000000011', '2008-04-12', 'M',
            'Secundaria incompleta', 0, 'F', '2026-01-15', 'F',
            'Registro ficticio para pruebas de integración UZDI', 'V', NOW()
        ) RETURNING adlc_id INTO v_adlc_1;
    ELSE
        SELECT adlc_id INTO v_adlc_1 FROM adolescente.adolescente WHERE cedula = '0000000011';
    END IF;

    -- 2. ADOLESCENTE 2 (Guayaquil / UZDI Guayas Centro)
    IF NOT EXISTS (SELECT 1 FROM adolescente.adolescente WHERE cedula = '0000000022') THEN
        INSERT INTO adolescente.adolescente (
            nacn_id, etcv_id, etna_id, cntn_id, gdo_id,
            nombre, apellido, cedula, fecha_nac, sexo,
            nved_nombre, hijos, reincide, fecha_ingr, "hijoPpl",
            observaciones, estado, "fcCrea"
        ) VALUES (
            1, 1, 3, v_cntn_guayaquil, 2,
            'María Belén (Prueba)', 'Castillo Romero', '0000000022', '2008-09-20', 'F',
            'Bachillerato en curso', 0, 'F', '2026-02-01', 'F',
            'Registro ficticio para pruebas de integración UZDI', 'V', NOW()
        ) RETURNING adlc_id INTO v_adlc_2;
    ELSE
        SELECT adlc_id INTO v_adlc_2 FROM adolescente.adolescente WHERE cedula = '0000000022';
    END IF;

    -- 3. ADOLESCENTE 3 (Cuenca / UZDI Azuay Cuenca)
    IF NOT EXISTS (SELECT 1 FROM adolescente.adolescente WHERE cedula = '0000000033') THEN
        INSERT INTO adolescente.adolescente (
            nacn_id, etcv_id, etna_id, cntn_id, gdo_id,
            nombre, apellido, cedula, fecha_nac, sexo,
            nved_nombre, hijos, reincide, fecha_ingr, "hijoPpl",
            observaciones, estado, "fcCrea"
        ) VALUES (
            1, 1, 1, v_cntn_cuenca, 1,
            'Mateo David (Prueba)', 'Salgado Paredes', '0000000033', '2009-01-08', 'M',
            'Secundaria', 0, 'V', '2026-02-10', 'F',
            'Registro ficticio para pruebas de integración UZDI', 'V', NOW()
        ) RETURNING adlc_id INTO v_adlc_3;
    ELSE
        SELECT adlc_id INTO v_adlc_3 FROM adolescente.adolescente WHERE cedula = '0000000033';
    END IF;

    -- 4. ADOLESCENTE 4 (Ambato / UZDI Tungurahua Ambato)
    IF NOT EXISTS (SELECT 1 FROM adolescente.adolescente WHERE cedula = '0000000044') THEN
        INSERT INTO adolescente.adolescente (
            nacn_id, etcv_id, etna_id, cntn_id, gdo_id,
            nombre, apellido, cedula, fecha_nac, sexo,
            nved_nombre, hijos, reincide, fecha_ingr, "hijoPpl",
            observaciones, estado, "fcCrea"
        ) VALUES (
            2, 2, 2, v_cntn_ambato, 3,
            'Ana Lucía (Prueba)', 'Toapanta Cajas', '0000000044', '2007-11-30', 'F',
            'Educación Básica', 1, 'F', '2025-11-20', 'V',
            'Registro ficticio para pruebas de integración UZDI', 'V', NOW()
        ) RETURNING adlc_id INTO v_adlc_4;
    ELSE
        SELECT adlc_id INTO v_adlc_4 FROM adolescente.adolescente WHERE cedula = '0000000044';
    END IF;

    -- 5. ADOLESCENTE 5 (Ibarra / UZDI Imbabura Ibarra)
    IF NOT EXISTS (SELECT 1 FROM adolescente.adolescente WHERE cedula = '0000000055') THEN
        INSERT INTO adolescente.adolescente (
            nacn_id, etcv_id, etna_id, cntn_id, gdo_id,
            nombre, apellido, cedula, fecha_nac, sexo,
            nved_nombre, hijos, reincide, fecha_ingr, "hijoPpl",
            observaciones, estado, "fcCrea"
        ) VALUES (
            1, 1, 1, v_cntn_ibarra, 1,
            'Kevin Alexander (Prueba)', 'Villacís Guerrero', '0000000055', '2008-07-18', 'M',
            'Bachillerato en curso', 0, 'F', '2025-08-14', 'F',
            'Registro ficticio para pruebas de integración UZDI', 'V', NOW()
        ) RETURNING adlc_id INTO v_adlc_5;
    ELSE
        SELECT adlc_id INTO v_adlc_5 FROM adolescente.adolescente WHERE cedula = '0000000055';
    END IF;

    -- ==========================================================================
    -- 2. EXPEDIENTES JUDICIALES ASOCIADOS CON DISTINTOS ESTADOS PROCESALES
    -- Estados: 'En proceso', 'Atraso', 'Incomparecencia', 'Concluido', 'Archivado'
    -- ==========================================================================

    -- Expediente 1: En proceso (UZDI Pichincha Norte, Infracción 1)
    IF NOT EXISTS (SELECT 1 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-001') THEN
        INSERT INTO adolescente.expediente (
            adlc_id, uzdi_id, infc_id, numero_causa, estado_procesal, observaciones, estado, "fcCrea"
        ) VALUES (
            v_adlc_1, 1, 1, 'EXP-PRUEBA-2026-001', 'En proceso',
            'Causa de prueba en cumplimiento regular de medida socioeducativa', 'V', NOW()
        ) RETURNING expe_id INTO v_expe_1;
    ELSE
        SELECT expe_id INTO v_expe_1 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-001';
    END IF;

    -- Expediente 2: En proceso (UZDI Guayas Centro, Infracción 2)
    IF NOT EXISTS (SELECT 1 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-002') THEN
        INSERT INTO adolescente.expediente (
            adlc_id, uzdi_id, infc_id, numero_causa, estado_procesal, observaciones, estado, "fcCrea"
        ) VALUES (
            v_adlc_2, 3, 2, 'EXP-PRUEBA-2026-002', 'En proceso',
            'Causa de prueba asignada a la sede Guayas Centro', 'V', NOW()
        ) RETURNING expe_id INTO v_expe_2;
    ELSE
        SELECT expe_id INTO v_expe_2 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-002';
    END IF;

    -- Expediente 3: Atraso (UZDI Azuay Cuenca, Infracción 3)
    IF NOT EXISTS (SELECT 1 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-003') THEN
        INSERT INTO adolescente.expediente (
            adlc_id, uzdi_id, infc_id, numero_causa, estado_procesal, observaciones, estado, "fcCrea"
        ) VALUES (
            v_adlc_3, 4, 3, 'EXP-PRUEBA-2026-003', 'Atraso',
            'Causa de prueba con reporte de atraso en plan de actividades', 'V', NOW()
        ) RETURNING expe_id INTO v_expe_3;
    ELSE
        SELECT expe_id INTO v_expe_3 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-003';
    END IF;

    -- Expediente 4: Incomparecencia (UZDI Tungurahua Ambato, Infracción 4)
    IF NOT EXISTS (SELECT 1 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-004') THEN
        INSERT INTO adolescente.expediente (
            adlc_id, uzdi_id, infc_id, numero_causa, estado_procesal, observaciones, estado, "fcCrea"
        ) VALUES (
            v_adlc_4, 5, 4, 'EXP-PRUEBA-2026-004', 'Incomparecencia',
            'Causa de prueba con alerta de incomparecencia a talleres socioeducativos', 'V', NOW()
        ) RETURNING expe_id INTO v_expe_4;
    ELSE
        SELECT expe_id INTO v_expe_4 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-004';
    END IF;

    -- Expediente 5: Concluido (UZDI Imbabura Ibarra, Infracción 1)
    IF NOT EXISTS (SELECT 1 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-005') THEN
        INSERT INTO adolescente.expediente (
            adlc_id, uzdi_id, infc_id, numero_causa, estado_procesal, observaciones, estado, "fcCrea"
        ) VALUES (
            v_adlc_5, 6, 1, 'EXP-PRUEBA-2026-005', 'Concluido',
            'Causa de prueba finalizada exitosamente con cumplimiento total de la medida', 'V', NOW()
        ) RETURNING expe_id INTO v_expe_5;
    ELSE
        SELECT expe_id INTO v_expe_5 FROM adolescente.expediente WHERE numero_causa = 'EXP-PRUEBA-2026-005';
    END IF;

    -- ==========================================================================
    -- 3. MEDIDAS SOCIOEDUCATIVAS ASIGNADAS A CADA EXPEDIENTE
    -- Estados: 'En proceso', 'Cumplida', 'Incumplida'
    -- Medidas: 1 (Amonestación), 2 (Imposición de reglas), 3 (Orientación y apoyo familiar),
    --          4 (Servicio a la comunidad), 5 (Libertad asistida)
    -- ==========================================================================

    -- Medida Exp 1: Servicio a la comunidad (mdso_id = 4) - 'En proceso'
    IF NOT EXISTS (SELECT 1 FROM adolescente.medida_expediente WHERE expe_id = v_expe_1 AND mdso_id = 4) THEN
        INSERT INTO adolescente.medida_expediente (
            expe_id, mdso_id, orden, fecha_inicio, fecha_fin, estado_cumplimiento, observaciones, estado, "fcCrea"
        ) VALUES (
            v_expe_1, 4, 1, '2026-02-01', '2026-06-01', 'En proceso',
            'Prestación de servicios comunitarios en centro municipal', 'V', NOW()
        );
    END IF;

    -- Medida Exp 2: Orientación y apoyo familiar (mdso_id = 3) - 'En proceso'
    IF NOT EXISTS (SELECT 1 FROM adolescente.medida_expediente WHERE expe_id = v_expe_2 AND mdso_id = 3) THEN
        INSERT INTO adolescente.medida_expediente (
            expe_id, mdso_id, orden, fecha_inicio, fecha_fin, estado_cumplimiento, observaciones, estado, "fcCrea"
        ) VALUES (
            v_expe_2, 3, 1, '2026-02-15', '2026-08-15', 'En proceso',
            'Sesiones quincenales de apoyo familiar y psicológico', 'V', NOW()
        );
    END IF;

    -- Medida Exp 3: Libertad asistida (mdso_id = 5) - 'En proceso' con atraso
    IF NOT EXISTS (SELECT 1 FROM adolescente.medida_expediente WHERE expe_id = v_expe_3 AND mdso_id = 5) THEN
        INSERT INTO adolescente.medida_expediente (
            expe_id, mdso_id, orden, fecha_inicio, fecha_fin, estado_cumplimiento, observaciones, estado, "fcCrea"
        ) VALUES (
            v_expe_3, 5, 1, '2026-02-20', '2026-08-20', 'En proceso',
            'Seguimiento por equipo técnico de la UZDI Cuenca', 'V', NOW()
        );
    END IF;

    -- Medida Exp 4: Imposición de reglas de conducta (mdso_id = 2) - 'Incumplida'
    IF NOT EXISTS (SELECT 1 FROM adolescente.medida_expediente WHERE expe_id = v_expe_4 AND mdso_id = 2) THEN
        INSERT INTO adolescente.medida_expediente (
            expe_id, mdso_id, orden, fecha_inicio, fecha_fin, estado_cumplimiento, observaciones, estado, "fcCrea"
        ) VALUES (
            v_expe_4, 2, 1, '2025-12-01', '2026-03-01', 'Incumplida',
            'Se reportó incomparecencia a las sesiones pautadas', 'V', NOW()
        );
    END IF;

    -- Medida Exp 5: Amonestación (mdso_id = 1) - 'Cumplida'
    IF NOT EXISTS (SELECT 1 FROM adolescente.medida_expediente WHERE expe_id = v_expe_5 AND mdso_id = 1) THEN
        INSERT INTO adolescente.medida_expediente (
            expe_id, mdso_id, orden, fecha_inicio, fecha_fin, estado_cumplimiento, observaciones, estado, "fcCrea"
        ) VALUES (
            v_expe_5, 1, 1, '2025-09-01', '2025-12-01', 'Cumplida',
            'Amonestación verbal y compromiso cumplido satisfactoriamente', 'V', NOW()
        );
    END IF;

END $$;
