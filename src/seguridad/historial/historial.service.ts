import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Historial } from './entities/historial.entity';
import { HistorialQueryDto } from './dto/historial-query.dto';

/** seguridad.historial — Solo lectura: lo alimentan los triggers de PostgreSQL. */
@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Historial)
    private readonly repository: Repository<Historial>,
  ) {}

  async findAll(q: HistorialQueryDto) {
    const where: FindOptionsWhere<Historial> = {};
    if (q.tabla) where.tablaAfectada = q.tabla;
    if (q.registro_id !== undefined) where.registroId = q.registro_id;
    if (q.usuario_id !== undefined) where.usuarioId = q.usuario_id;
    if (q.accion) where.accion = q.accion;
    const desde = q.desde ? new Date(q.desde) : undefined;
    const hasta = q.hasta
      ? new Date(`${q.hasta.slice(0, 10)}T23:59:59.999`)
      : undefined;
    if (desde && hasta) where.fecha = Between(desde, hasta);
    else if (desde) where.fecha = MoreThanOrEqual(desde);
    else if (hasta) where.fecha = LessThanOrEqual(hasta);

    const pagina = q.pagina ?? 1;
    const limite = q.limite ?? 50;
    const [registros, total] = await this.repository.findAndCount({
      where,
      order: { fecha: 'DESC', id: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return {
      message: 'Historial de auditoría',
      data: { total, pagina, limite, registros },
    };
  }

  async findOne(id: number) {
    const data = await this.repository.findOne({ where: { id } });
    if (!data)
      throw new NotFoundException(
        `No existe el registro de historial hist_id=${id}`,
      );
    return { message: `Registro de auditoría hist_id=${id}`, data };
  }
}
