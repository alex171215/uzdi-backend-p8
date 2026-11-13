import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Adolescente } from '../adolescente/adolescente/entities/adolescente.entity';
import { Expediente } from '../adolescente/expediente/entities/expediente.entity';
import { Uzdi } from '../estructura-institucional/uzdi/entities/uzdi.entity';
import { FiltroReporteDto } from './dto/filtro-reporte.dto';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Adolescente)
    private readonly adolescenteRepo: Repository<Adolescente>,
    @InjectRepository(Expediente)
    private readonly expedienteRepo: Repository<Expediente>,
    @InjectRepository(Uzdi)
    private readonly uzdiRepo: Repository<Uzdi>,
  ) {}

  async obtenerReporteAdolescentes(filtros: FiltroReporteDto) {
    const qb = this.adolescenteRepo.createQueryBuilder('adlc')
      .leftJoinAndSelect('adlc.canton', 'cntn')
      .leftJoinAndSelect('cntn.provincia', 'prov')
      .leftJoinAndSelect('adlc.nacionalidad', 'nacn')
      .leftJoinAndSelect('adlc.etnia', 'etna')
      .leftJoinAndSelect('adlc.estadoCivil', 'etcv')
      .leftJoinAndSelect('adlc.gdo', 'gdo')
      .where('adlc.estado = :estado', { estado: true });

    if (filtros.cntn_id) {
      qb.andWhere('adlc.cntn_id = :cntn_id', { cntn_id: filtros.cntn_id });
    }

    if (filtros.prov_id) {
      qb.andWhere('cntn.prov_id = :prov_id', { prov_id: filtros.prov_id });
    }

    const adolescentes = await qb.orderBy('adlc.apellido', 'ASC').getMany();

    return {
      total: adolescentes.length,
      fecha_generacion: new Date().toISOString(),
      filtros_aplicados: filtros,
      registros: adolescentes.map((a) => ({
        id: a.id,
        cedula: a.cedula,
        nombre_completo: `${a.apellido} ${a.nombre}`,
        sexo: a.sexo,
        fecha_nac: a.fecha_nac,
        nacionalidad: a.nacionalidad?.nombre ?? 'No registrada',
        etnia: a.etnia?.nombre ?? 'No registrada',
        estado_civil: a.estadoCivil?.nombre ?? 'No registrado',
        canton: a.canton?.nombre ?? 'No registrado',
        provincia: a.canton?.provincia?.nombre ?? 'No registrada',
        gdo: a.gdo?.nombre ?? 'Ninguno',
        reincidente: a.reincide ? 'Sí' : 'No',
        hijos: a.hijos,
      })),
    };
  }

  async obtenerReporteExpedientes(filtros: FiltroReporteDto) {
    const qb = this.expedienteRepo.createQueryBuilder('expe')
      .leftJoinAndSelect('expe.adolescente', 'adlc')
      .leftJoinAndSelect('expe.uzdi', 'uzdi')
      .leftJoinAndSelect('uzdi.canton', 'uzdi_cntn')
      .leftJoinAndSelect('uzdi_cntn.provincia', 'uzdi_prov')
      .leftJoinAndSelect('expe.infraccion', 'infc')
      .leftJoinAndSelect('expe.medidas', 'med_exp')
      .leftJoinAndSelect('med_exp.medida', 'mdso')
      .where('expe.estado = :estado', { estado: true });

    if (filtros.uzdi_id) {
      qb.andWhere('expe.uzdi_id = :uzdi_id', { uzdi_id: filtros.uzdi_id });
    }

    if (filtros.estado_procesal) {
      qb.andWhere('expe.estado_procesal = :estado_procesal', {
        estado_procesal: filtros.estado_procesal,
      });
    }

    const expedientes = await qb.orderBy('expe.id', 'DESC').getMany();

    return {
      total: expedientes.length,
      fecha_generacion: new Date().toISOString(),
      filtros_aplicados: filtros,
      registros: expedientes.map((e) => ({
        id: e.id,
        numero_causa: e.numero_causa ?? 'Sin número asignado',
        estado_procesal: e.estado_procesal,
        adolescente: `${e.adolescente?.apellido ?? ''} ${e.adolescente?.nombre ?? ''}`.trim(),
        cedula: e.adolescente?.cedula ?? '',
        sede_uzdi: e.uzdi?.nombre ?? 'No asignada',
        provincia_uzdi: e.uzdi?.canton?.provincia?.nombre ?? '',
        infraccion: e.infraccion?.nombre ?? 'No tipificada',
        medidas: (e.medidas ?? []).map((m) => ({
          orden: m.orden,
          tipo_medida: m.medida?.nombre ?? '',
          fecha_inicio: m.fecha_inicio,
          fecha_fin: m.fecha_fin,
          cumplimiento: m.estado_cumplimiento ?? 'En proceso',
        })),
      })),
    };
  }

  async generarExcel(filtros: FiltroReporteDto): Promise<Buffer> {
    const dataReporte = await this.obtenerReporteExpedientes(filtros);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema SNAI - UZDI (PUCE)';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Reporte Expedientes UZDI', {
      views: [{ showGridLines: true }],
    });

    // Título institucional
    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'SERVICIO NACIONAL DE ATENCIÓN INTEGRAL — SISTEMA UZDI (SNAI - PUCE)';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F497D' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    sheet.mergeCells('A2:H2');
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = `REPORTE CONSOLIDADO DE CAUSAS Y MEDIDAS SOCIOEDUCATIVAS — FECHA: ${new Date().toLocaleDateString()}`;
    subtitleCell.font = { name: 'Calibri', size: 11, italic: true };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).height = 20;

    // Encabezados de tabla
    const headers = [
      'N° Causa',
      'Estado Procesal',
      'Adolescente Infractor',
      'Cédula / Identificación',
      'Sede UZDI',
      'Provincia',
      'Infracción Tipificada',
      'Medidas Socioeducativas',
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF244062' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Filas de datos
    dataReporte.registros.forEach((r) => {
      const medidasTexto = r.medidas.length > 0
        ? r.medidas.map((m) => `[${m.orden}] ${m.tipo_medida} (${m.cumplimiento})`).join('; ')
        : 'Sin medidas registradas';

      const row = sheet.addRow([
        r.numero_causa,
        r.estado_procesal,
        r.adolescente,
        r.cedula,
        r.sede_uzdi,
        r.provincia_uzdi,
        r.infraccion,
        medidasTexto,
      ]);

      row.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        };
      });
    });

    // Auto-ajustar anchos de columnas
    sheet.columns = [
      { width: 22 },
      { width: 16 },
      { width: 30 },
      { width: 18 },
      { width: 22 },
      { width: 18 },
      { width: 26 },
      { width: 45 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generarPdf(filtros: FiltroReporteDto): Promise<Buffer> {
    const data = await this.obtenerReporteExpedientes(filtros);

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 36,
        size: 'A4',
        layout: 'landscape',
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Encabezado institucional SNAI / PUCE
      doc.rect(36, 36, doc.page.width - 72, 48).fill('#1f497d');
      doc
        .fillColor('#ffffff')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('SERVICIO NACIONAL DE ATENCIÓN INTEGRAL (SNAI) - UZDI', 46, 46, {
          align: 'center',
          width: doc.page.width - 92,
        });
      doc
        .fontSize(9)
        .font('Helvetica')
        .text(
          'Ficha Ejecutiva Oficial de Causas Judiciales y Medidas Socioeducativas',
          46,
          63,
          { align: 'center', width: doc.page.width - 92 },
        );

      // Metadatos
      doc
        .fillColor('#333333')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text(`Fecha de Emisión: ${new Date().toLocaleString()}`, 36, 94)
        .text(`Total de Expedientes Consolidados: ${data.total}`, 36, 106);

      // Configuración de tabla
      const startX = 36;
      let startY = 122;
      const colWidths = [85, 75, 120, 70, 100, 100, 210];
      const colHeaders = [
        'Causa N°',
        'Estado',
        'Adolescente',
        'Cédula',
        'Sede UZDI',
        'Infracción',
        'Medidas Socioeducativas',
      ];

      // Cabecera de la tabla
      doc.rect(startX, startY, doc.page.width - 72, 20).fill('#244062');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      let currentX = startX;
      for (let i = 0; i < colHeaders.length; i++) {
        doc.text(colHeaders[i], currentX + 4, startY + 5, {
          width: colWidths[i] - 8,
          align: 'left',
        });
        currentX += colWidths[i];
      }

      startY += 20;

      // Filas de datos
      doc.font('Helvetica').fontSize(8);
      data.registros.forEach((reg, index) => {
        const rowHeight = 22;
        if (startY + rowHeight > doc.page.height - 45) {
          doc.addPage({ margin: 36, size: 'A4', layout: 'landscape' });
          startY = 36;

          // Repetir cabecera en nueva página
          doc.rect(startX, startY, doc.page.width - 72, 20).fill('#244062');
          doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
          let cx = startX;
          for (let i = 0; i < colHeaders.length; i++) {
            doc.text(colHeaders[i], cx + 4, startY + 5, {
              width: colWidths[i] - 8,
              align: 'left',
            });
            cx += colWidths[i];
          }
          startY += 20;
          doc.font('Helvetica').fontSize(8);
        }

        // Fondo alternado para legibilidad
        if (index % 2 === 0) {
          doc.rect(startX, startY, doc.page.width - 72, rowHeight).fill('#f8fafc');
        } else {
          doc.rect(startX, startY, doc.page.width - 72, rowHeight).fill('#ffffff');
        }

        // Línea divisoria
        doc
          .rect(startX, startY, doc.page.width - 72, rowHeight)
          .strokeColor('#cbd5e1')
          .lineWidth(0.5)
          .stroke();

        doc.fillColor('#1e293b');
        const medidasText =
          reg.medidas && reg.medidas.length > 0
            ? reg.medidas
                .map((m) => `[${m.orden}] ${m.tipo_medida} (${m.cumplimiento})`)
                .join('; ')
            : 'Sin medidas';

        const rowValues = [
          reg.numero_causa || 'S/N',
          reg.estado_procesal || '',
          reg.adolescente || '',
          reg.cedula || '',
          reg.sede_uzdi || '',
          reg.infraccion || '',
          medidasText,
        ];

        let cx = startX;
        for (let i = 0; i < rowValues.length; i++) {
          doc.text(rowValues[i], cx + 4, startY + 6, {
            width: colWidths[i] - 8,
            height: rowHeight - 6,
            ellipsis: true,
          });
          cx += colWidths[i];
        }

        startY += rowHeight;
      });

      // Pie de página con numeración total
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .text(
            `Página ${i + 1} de ${pages.count} — Sistema UZDI SNAI / PUCE (Documento Oficial)`,
            36,
            doc.page.height - 25,
            { align: 'center', width: doc.page.width - 72 },
          );
      }

      doc.end();
    });
  }

  async generarHtmlPdf(filtros: FiltroReporteDto): Promise<string> {
    const data = await this.obtenerReporteExpedientes(filtros);

    const rowsHtml = data.registros.map((r, i) => `
      <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
        <td style="padding: 8px; border: 1px solid #dee2e6; font-weight: bold;">${r.numero_causa}</td>
        <td style="padding: 8px; border: 1px solid #dee2e6;">${r.estado_procesal}</td>
        <td style="padding: 8px; border: 1px solid #dee2e6;">${r.adolescente}</td>
        <td style="padding: 8px; border: 1px solid #dee2e6;">${r.cedula}</td>
        <td style="padding: 8px; border: 1px solid #dee2e6;">${r.sede_uzdi} (${r.provincia_uzdi})</td>
        <td style="padding: 8px; border: 1px solid #dee2e6;">${r.infraccion}</td>
        <td style="padding: 8px; border: 1px solid #dee2e6; font-size: 11px;">
          ${r.medidas.map((m) => `• [Orden ${m.orden}] ${m.tipo_medida} — <em>${m.cumplimiento}</em>`).join('<br/>') || 'Sin medidas'}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte Institucional SNAI UZDI</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #1f497d; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 18px; color: #1f497d; text-transform: uppercase; }
          .header h2 { margin: 5px 0 0 0; font-size: 13px; color: #555; }
          .meta { font-size: 11px; color: #666; margin-bottom: 15px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background-color: #1f497d; color: white; padding: 10px 8px; text-align: left; border: 1px solid #1f497d; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="padding: 8px 16px; background-color: #1f497d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
            🖨️ Imprimir / Guardar como PDF
          </button>
        </div>
        <div class="header">
          <h1>Servicio Nacional de Atención Integral a Personas Adultas Privadas de la Libertad y a Adolescentes Infractores (SNAI)</h1>
          <h2>Sistema de Gestión Integral UZDI — Pontificia Universidad Católica del Ecuador</h2>
          <p style="margin: 4px 0 0; font-size: 12px; font-weight: bold; color: #244062;">FICHA EJECUTIVA DE CAUSAS Y MEDIDAS SOCIOEDUCATIVAS</p>
        </div>
        <div class="meta">
          <span><strong>Fecha de Emisión:</strong> ${new Date().toLocaleString()}</span>
          <span><strong>Total de Registros:</strong> ${data.total} expedientes</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Causa N°</th>
              <th>Estado</th>
              <th>Adolescente</th>
              <th>Cédula</th>
              <th>Sede UZDI</th>
              <th>Infracción</th>
              <th>Medidas Socioeducativas</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #888;">
          Documento institucional oficial emitido automáticamente por la API REST Backend UZDI v2.0
        </div>
      </body>
      </html>
    `;
  }
}
