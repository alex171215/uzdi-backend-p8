import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { type Response } from 'express';
import { ReportesService } from './reportes.service';
import { FiltroReporteDto } from './dto/filtro-reporte.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Rol } from '../common/enums/rol.enum';

@ApiTags('Reportes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('uzdi/adolescentes')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR, Rol.JURIDICO, Rol.TRABAJADOR_SOCIAL, Rol.PSICOLOGO)
  @ApiOperation({ summary: 'Consolidado de adolescentes activos por provincia, cantón y sede UZDI' })
  @ApiResponse({ status: 200, description: 'Listado consolidado de adolescentes' })
  obtenerReporteAdolescentes(@Query() filtros: FiltroReporteDto) {
    return this.reportesService.obtenerReporteAdolescentes(filtros);
  }

  @Get('expedientes/medidas')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR, Rol.JURIDICO)
  @ApiOperation({ summary: 'Resumen procesal de expedientes con infracciones y medidas socioeducativas' })
  @ApiResponse({ status: 200, description: 'Listado de causas judiciales y estado de cumplimiento' })
  obtenerReporteExpedientes(@Query() filtros: FiltroReporteDto) {
    return this.reportesService.obtenerReporteExpedientes(filtros);
  }

  @Get('export/excel')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR, Rol.JURIDICO)
  @ApiOperation({ summary: 'Descarga del reporte consolidado en formato Microsoft Excel (.xlsx)' })
  @ApiResponse({ status: 200, description: 'Archivo binario Excel generado exitosamente' })
  async exportarExcel(@Query() filtros: FiltroReporteDto, @Res() res: Response) {
    const buffer = await this.reportesService.generarExcel(filtros);
    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_uzdi_snai_${fecha}.xlsx"`,
    );
    res.send(buffer);
  }

  @Get('export/pdf')
  @Roles(Rol.ADMINISTRADOR, Rol.SUPERADMINISTRADOR, Rol.COORDINADOR, Rol.JURIDICO)
  @ApiOperation({ summary: 'Ficha ejecutiva institucional en formato para imprimir/guardar en PDF' })
  @ApiResponse({ status: 200, description: 'Documento HTML con formato institucional para exportar a PDF' })
  async exportarPdf(@Query() filtros: FiltroReporteDto, @Res() res: Response) {
    const html = await this.reportesService.generarHtmlPdf(filtros);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
