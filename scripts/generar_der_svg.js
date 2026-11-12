const fs = require('fs');
const path = require('path');

// Generador de Diagrama Entidad-Relacion (DER) Oficial en formato vectorial SVG
// Cumple con la metodologia del Ing. Guido (DDL v8, campos fcCrea y fcMod, recuadro ER CAI y CONA)

const width = 3200;
const height = 2400;

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderTable(table) {
  const { x, y, w, title, schema, color, bgHeader, fields } = table;
  const rowHeight = 22;
  const headerHeight = 36;
  const boxHeight = headerHeight + fields.length * rowHeight + 12;

  let fieldsSvg = '';
  fields.forEach((f, idx) => {
    const py = y + headerHeight + 16 + idx * rowHeight;
    const isPk = f.startsWith('PK:');
    const isFk = f.startsWith('FK:');
    const isAudit = f.includes('fcCrea') || f.includes('fcMod');
    let fill = '#333333';
    let weight = 'normal';
    let badge = '';

    if (isPk) {
      fill = '#B71C1C';
      weight = 'bold';
      badge = '🔑 ';
    } else if (isFk) {
      fill = '#0D47A1';
      weight = '600';
      badge = '🔗 ';
    } else if (isAudit) {
      fill = '#558B2F';
      weight = '600';
      badge = '🕒 ';
    }

    fieldsSvg += `<text x="${x + 14}" y="${py}" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="${weight}" fill="${fill}">${badge}${esc(f)}</text>\n`;
  });

  return `
    <!-- Tabla: ${schema}.${title} -->
    <g id="tbl_${schema}_${title}">
      <rect x="${x}" y="${y}" width="${w}" height="${boxHeight}" rx="8" ry="8" fill="#FFFFFF" stroke="${color}" stroke-width="2" filter="url(#drop-shadow)" />
      <path d="M ${x},${y + 8} Q ${x},${y} ${x + 8},${y} L ${x + w - 8},${y} Q ${x + w},${y} ${x + w},${y + 8} L ${x + w},${y + headerHeight} L ${x},${y + headerHeight} Z" fill="${bgHeader}" />
      <text x="${x + 14}" y="${y + 16}" font-family="Segoe UI, Arial, sans-serif" font-size="10" font-weight="600" fill="#FFFFFF" letter-spacing="1">${esc(schema.toUpperCase())}</text>
      <text x="${x + 14}" y="${y + 30}" font-family="Segoe UI, Arial, sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">${esc(title)}</text>
      <line x1="${x}" y1="${y + headerHeight}" x2="${x + w}" y2="${y + headerHeight}" stroke="${color}" stroke-width="1.5" />
      ${fieldsSvg}
    </g>
  `;
}

function renderRelation(rel) {
  const { x1, y1, x2, y2, color, label } = rel;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `
    <g>
      <path d="M ${x1} ${y1} Q ${mx} ${y1} ${mx} ${my} T ${x2} ${y2}" fill="none" stroke="${color || '#607D8B'}" stroke-width="2" stroke-dasharray="4,2" marker-end="url(#arrow)" />
      ${label ? `<rect x="${mx - 50}" y="${my - 12}" width="100" height="20" rx="4" fill="#FFFFFF" stroke="${color || '#607D8B'}" stroke-width="1" />
      <text x="${mx}" y="${my + 2}" font-family="Segoe UI, Arial" font-size="10" font-weight="bold" fill="${color || '#37474F'}" text-anchor="middle">${label}</text>` : ''}
    </g>
  `;
}

const tables = [
  // 1. ESTRUCTURA INSTITUCIONAL
  {
    x: 60, y: 150, w: 320, schema: 'estructura_institucional', title: 'provincia',
    color: '#1565C0', bgHeader: '#1565C0',
    fields: [
      'PK: prov_id : INT4',
      'provcdgo : VARCHAR(20) [UQ]',
      'provnmbr : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 60, y: 360, w: 320, schema: 'estructura_institucional', title: 'canton',
    color: '#1565C0', bgHeader: '#1976D2',
    fields: [
      'PK: cntn_id : INT4',
      'FK: prov_id : INT4 -> provincia',
      'cntncdgo : VARCHAR(20) [UQ]',
      'cntnnmbr : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 60, y: 590, w: 320, schema: 'estructura_institucional', title: 'uzdi',
    color: '#1565C0', bgHeader: '#0D47A1',
    fields: [
      'PK: uzdi_id : INT4',
      'FK: cntn_id : INT4 -> canton',
      'uzdinmbr : VARCHAR(255)',
      'uzdizona : VARCHAR(100)',
      'uzdidrcc : VARCHAR(255)',
      'uzditlfn : VARCHAR(20)',
      'uzdimail : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },

  // 2. NUCLEO SOCIODEMOGRAFICO
  {
    x: 430, y: 150, w: 380, schema: 'adolescente', title: 'adolescente',
    color: '#2E7D32', bgHeader: '#2E7D32',
    fields: [
      'PK: adlc_id : INT4',
      'adlccdla : VARCHAR(20) [UQ]',
      'adlcnmbr : VARCHAR(100)',
      'adlcapll : VARCHAR(100)',
      'adlcfcna : DATE',
      'adlcsexo : CHAR(1) [M/F/O]',
      'adlcfcin : DATE',
      'FK: nacn_id : INT4 -> nacionalidad',
      'FK: etcv_id : INT4 -> estado_civil',
      'FK: etna_id : INT4 -> etnia',
      'FK: cntn_id : INT4 -> canton',
      'FK: gdo_id : INT4 (Opcional)',
      'adlcnved : VARCHAR(100)',
      'adlchjos : INT4 DEFAULT 0',
      'adlcrncd : CHAR(1) [V/F]',
      'adlchppl : CHAR(1) [V/F]',
      'adlcsitu : VARCHAR(50)',
      'adlcmtvb : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 430, y: 720, w: 260, schema: 'adolescente', title: 'nacionalidad',
    color: '#2E7D32', bgHeader: '#388E3C',
    fields: [
      'PK: nacn_id : INT4',
      'nacnnmbr : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 710, y: 720, w: 260, schema: 'adolescente', title: 'estado_civil',
    color: '#2E7D32', bgHeader: '#388E3C',
    fields: [
      'PK: etcv_id : INT4',
      'etcvnmbr : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 430, y: 900, w: 260, schema: 'adolescente', title: 'etnia',
    color: '#2E7D32', bgHeader: '#388E3C',
    fields: [
      'PK: etna_id : INT4',
      'etnanmbr : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 710, y: 900, w: 260, schema: 'adolescente', title: 'gdo',
    color: '#2E7D32', bgHeader: '#388E3C',
    fields: [
      'PK: gdo_id : INT4',
      'gdonmbr : VARCHAR(255)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },

  // 3. DOMINIO JUDICIAL Y MEDIDAS CONA
  {
    x: 870, y: 150, w: 380, schema: 'adolescente', title: 'expediente',
    color: '#C62828', bgHeader: '#C62828',
    fields: [
      'PK: expe_id : INT4',
      'FK: adlc_id : INT4 -> adolescente',
      'FK: uzdi_id : INT4 -> uzdi',
      'FK: infc_id : INT4 -> infraccion',
      'numero_causa : VARCHAR(100) [UQ activos]',
      'expeetps : VARCHAR(50)',
      'expeobsr : TEXT',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 870, y: 450, w: 420, schema: 'adolescente', title: 'medida_expediente (CONA)',
    color: '#B71C1C', bgHeader: '#B71C1C',
    fields: [
      'PK: mdex_id : INT4',
      'FK: expe_id : INT4 -> expediente',
      'FK: mdso_id : INT4 -> medida_socioeducativa',
      'orden : INT4 NOT NULL [>= 1] (Regla CONA)',
      'fecha_inicio : DATE NOT NULL',
      'fecha_fin : DATE [>= fecha_inicio]',
      'estado_cumplimiento : VARCHAR(50)',
      'observaciones : TEXT',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 1320, y: 150, w: 320, schema: 'adolescente', title: 'infraccion',
    color: '#C62828', bgHeader: '#D32F2F',
    fields: [
      'PK: infc_id : INT4',
      'infcnmbr : VARCHAR(255)',
      'infcctgr : VARCHAR(127)',
      'infcartc : VARCHAR(50) [CONA/COIP]',
      'infcdscr : TEXT',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 1320, y: 390, w: 340, schema: 'adolescente', title: 'medida_socioeducativa',
    color: '#C62828', bgHeader: '#D32F2F',
    fields: [
      'PK: mdso_id : INT4',
      'mdsonmbr : VARCHAR(255)',
      'mdsodrcn : INT4 (Meses)',
      'mdsodscr : TEXT',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },

  // 4. CONTEXTO FAMILIAR
  {
    x: 60, y: 880, w: 330, schema: 'contexto_familiar', title: 'tipo_parentesco',
    color: '#7B1FA2', bgHeader: '#7B1FA2',
    fields: [
      'PK: tprt_id : INT4',
      'tprtnmbr : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 60, y: 1070, w: 330, schema: 'contexto_familiar', title: 'representante',
    color: '#7B1FA2', bgHeader: '#8E24AA',
    fields: [
      'PK: repr_id : INT4',
      'FK: cntn_id : INT4 -> canton',
      'reprcdla : VARCHAR(20) [UQ]',
      'reprnmbr : VARCHAR(100)',
      'reprapll : VARCHAR(100)',
      'reprtlfn : VARCHAR(20)',
      'reprdrcc : VARCHAR(255)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 430, y: 1080, w: 380, schema: 'contexto_familiar', title: 'adolescente_representante',
    color: '#7B1FA2', bgHeader: '#6A1B9A',
    fields: [
      'PK: adre_id : INT4',
      'FK: adlc_id : INT4 -> adolescente',
      'FK: repr_id : INT4 -> representante',
      'FK: tprt_id : INT4 -> tipo_parentesco',
      'adre_es_referente : CHAR(1) DEFAULT \'V\'',
      'adrefcin : DATE',
      'adrefcfn : DATE',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },

  // 5. TALLERES Y GESTION DOCUMENTAL
  {
    x: 870, y: 750, w: 360, schema: 'talleres_actividades', title: 'taller',
    color: '#00695C', bgHeader: '#00695C',
    fields: [
      'PK: tall_id : INT4',
      'FK: uzdi_id : INT4 -> uzdi',
      'FK: prsn_id : INT4 -> prsn',
      'tallnmbr : VARCHAR(255)',
      'talltema : VARCHAR(255)',
      'tallfcha : DATE',
      'tallhrin : TIME',
      'tallhrfn : TIME',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 870, y: 1030, w: 400, schema: 'talleres_actividades', title: 'asistencia_taller',
    color: '#00695C', bgHeader: '#00796B',
    fields: [
      'PK: astl_id : INT4',
      'FK: tall_id : INT4 -> taller',
      'tipo_asistente : VARCHAR(20) [adlc/repr]',
      'FK: adlc_id : INT4 (Excluyente)',
      'FK: adre_id : INT4 (Excluyente)',
      'astlasst : CHAR(1) DEFAULT \'V\'',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 1300, y: 750, w: 340, schema: 'gestion_documental', title: 'tipo_documento',
    color: '#00695C', bgHeader: '#00897B',
    fields: [
      'PK: tpdc_id : INT4',
      'tpdcnmbr : VARCHAR(255)',
      'tpdcdscr : TEXT',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 1300, y: 960, w: 380, schema: 'gestion_documental', title: 'documento_expediente',
    color: '#00695C', bgHeader: '#004D40',
    fields: [
      'PK: dcex_id : INT4',
      'FK: expe_id : INT4 -> expediente',
      'FK: prsn_id : INT4 -> prsn',
      'FK: tpdc_id : INT4 -> tipo_documento',
      'dcexnmro : VARCHAR(100)',
      'dcexfcha : DATE',
      'dcexemsr : VARCHAR(255)',
      'dcexes_h : CHAR(1) [V/F]',
      'dcex_est : VARCHAR(50)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },

  // 6. RECUADRO DE SEGURIDAD ER CAI
  {
    x: 1720, y: 150, w: 360, schema: 'seguridad', title: 'tipo_persona (RF-12)',
    color: '#E65100', bgHeader: '#E65100',
    fields: [
      'PK: tppr_id : INT4',
      'tpprcdgo : VARCHAR(20) [UQ]',
      'tpprnmbr : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 1720, y: 350, w: 360, schema: 'seguridad', title: 'prsn (Usuario Institucional)',
    color: '#E65100', bgHeader: '#EF6C00',
    fields: [
      'PK: prsn_id : INT4',
      'FK: tppr_id : INT4 -> tipo_persona',
      'FK: uzdi_id : INT4 -> uzdi (Opcional)',
      'prsnnmbr : VARCHAR(100)',
      'prsnapll : VARCHAR(100)',
      'prsnmail : VARCHAR(100) [UQ]',
      'prsnlgin : VARCHAR(50) [UQ]',
      'prsnpswd : VARCHAR(255) [bcrypt]',
      'prsnsexo : CHAR(1)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 2140, y: 150, w: 340, schema: 'seguridad', title: 'prfl (Perfiles)',
    color: '#E65100', bgHeader: '#F57C00',
    fields: [
      'PK: prfl_id : INT4',
      'prflcdgo : VARCHAR(20) [UQ]',
      'prflnmbr : VARCHAR(100)',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 2140, y: 350, w: 340, schema: 'seguridad', title: 'prpf (Persona <-> Perfil)',
    color: '#E65100', bgHeader: '#F57C00',
    fields: [
      'PK: prpf_id : INT4',
      'FK: prsn_id : INT4 -> prsn',
      'FK: prfl_id : INT4 -> prfl',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 1720, y: 680, w: 360, schema: 'seguridad', title: 'accn (Acciones Operativas)',
    color: '#E65100', bgHeader: '#FB8C00',
    fields: [
      'PK: accn_id : INT4',
      'accnnmbr : VARCHAR(100) [UQ]',
      'accndscr : VARCHAR(255)',
      'accnadbl : CHAR(1) DEFAULT \'1\'',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 2140, y: 550, w: 340, schema: 'seguridad', title: 'prms (Matriz RBAC)',
    color: '#E65100', bgHeader: '#E65100',
    fields: [
      'PK: prms_id : INT4',
      'FK: prfl_id : INT4 -> prfl',
      'FK: accn_id : INT4 -> accn',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 2140, y: 750, w: 340, schema: 'seguridad', title: 'sesn (Sesiones y Tokens)',
    color: '#E65100', bgHeader: '#E65100',
    fields: [
      'PK: sesn_id : INT4',
      'FK: prsn_id : INT4 -> prsn',
      'FK: prfl_id : INT4 -> prfl',
      'sesnfcin : TIMESTAMP',
      'sesnfcfn : TIMESTAMP',
      'estado : CHAR(1) [V/F]',
      'fcCrea : TIMESTAMP',
      'fcMod : TIMESTAMP',
    ]
  },
  {
    x: 1720, y: 920, w: 420, schema: 'seguridad', title: 'historial (Auditoría Triggers)',
    color: '#37474F', bgHeader: '#37474F',
    fields: [
      'PK: hist_id : INT4',
      'hist_tabla : VARCHAR(100)',
      'hist_registro_id : INT4',
      'hist_usuario_id : INT4',
      'hist_fecha : TIMESTAMP [NOW()]',
      'hist_accion : VARCHAR(20)',
      'hist_estado_anterior : JSONB',
      'hist_estado_nuevo : JSONB',
    ]
  },
];

const relations = [
  // Geografía
  { x1: 380, y1: 420, x2: 380, y2: 220, color: '#1565C0', label: '1:N' },
  { x1: 380, y1: 650, x2: 380, y2: 450, color: '#1565C0', label: '1:N' },
  // Expediente -> Adolescente
  { x1: 870, y1: 260, x2: 810, y2: 260, color: '#C62828', label: '1:N' },
  // Medida_Expediente -> Expediente
  { x1: 1060, y1: 450, x2: 1060, y2: 380, color: '#B71C1C', label: '1:N (CONA)' },
  // Medida_Expediente -> Medida_Socioeducativa
  { x1: 1290, y1: 520, x2: 1320, y2: 450, color: '#B71C1C', label: '1:N' },
  // Expediente -> Infraccion
  { x1: 1250, y1: 240, x2: 1320, y2: 240, color: '#C62828', label: '1:N' },
  // Seguridad ER CAI
  { x1: 1900, y1: 350, x2: 1900, y2: 270, color: '#E65100', label: 'RF-12' },
  { x1: 2080, y1: 420, x2: 2140, y2: 420, color: '#E65100', label: 'N:M' },
  { x1: 2310, y1: 270, x2: 2310, y2: 350, color: '#E65100', label: '1:N' },
  { x1: 2310, y1: 470, x2: 2310, y2: 550, color: '#E65100', label: 'RBAC' },
  { x1: 2140, y1: 610, x2: 2080, y2: 740, color: '#E65100', label: 'Accion' },
];

let tablesHtml = tables.map(renderTable).join('\n');
let relationsHtml = relations.map(renderRelation).join('\n');

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <filter id="drop-shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.15" flood-color="#000000" />
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#455A64" />
    </marker>
  </defs>

  <!-- Fondo General -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="#F4F6F9" />

  <!-- ENCABEZADO FORMAL INSTITUCIONAL -->
  <rect x="60" y="30" width="3080" height="90" rx="10" ry="10" fill="#1F497D" filter="url(#drop-shadow)" />
  <text x="100" y="70" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF">
    DIAGRAMA ENTIDAD-RELACIÓN (DER) OFICIAL — SISTEMA DE GESTIÓN INTEGRAL UZDI (SNAI – PUCE)
  </text>
  <text x="100" y="98" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#BBDEFB">
    MODELO RELACIONAL OFICIAL DDL v8 | METODOLOGÍA DEL ING. GUIDO | ATRIBUTOS OBLIGATORIOS fcCrea Y fcMod EN CADA TABLA | RECUADRO ER CAI Y CONA
  </text>

  <!-- RECUADRO DE AGRUPACION ER CAI -->
  <rect x="1700" y="130" width="800" height="1140" rx="12" ry="12" fill="#FFF8E1" stroke="#FFA000" stroke-width="3" stroke-dasharray="8,4" />
  <text x="1720" y="145" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#E65100">
    RECUADRO DE SEGURIDAD ER CAI (MODELO OFICIAL DE CÁTEDRA: prsn, prfl, accn, prms, sesn, prpf, tipo_persona)
  </text>

  <!-- TABLAS -->
  ${tablesHtml}

  <!-- RELACIONES -->
  ${relationsHtml}

  <!-- PIE DE PAGINA -->
  <rect x="60" y="2330" width="3080" height="40" fill="#ECEFF1" rx="6" ry="6" />
  <text x="80" y="2355" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="600" fill="#455A64">
    Sistema UZDI v2.0 (SNAI - PUCE) — Generado oficialmente para el entregable de Cátedra de Ingeniería de Software — Noviembre 2026
  </text>
</svg>
`;

fs.writeFileSync(path.join(__dirname, '../docs/diagramas/DER_OFICIAL_UZDI_SNAI_ING_GUIDO.svg'), svgContent, 'utf-8');
console.log('SVG oficial del DER generado exitosamente en docs/diagramas/DER_OFICIAL_UZDI_SNAI_ING_GUIDO.svg');

