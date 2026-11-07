import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { Sesion } from './entities/sesion.entity';
import { SesionQueryDto } from './dto/sesion-query.dto';

/**
 * seguridad.sesn — Bitácora de sesiones. Las sesiones se crean solo desde
 * /auth/login y se cierran con /auth/logout o con el cierre forzado del ADM.
 * No se eliminan: son evidencia de auditoría.
 */
@Injectable()
export class SesionService {
  constructor(
    @InjectRepository(Sesion) private readonly repository: Repository<Sesion>,
  ) {}

  private resumir(s: Sesion) {
    return {
      id: s.id,
      inicio: s.fechaInicio,
      fin: s.fechaFin,
      abierta: s.estado && !s.fechaFin,
      perfil: s.perfil
        ? { id: s.perfil.id, codigo: s.perfil.codigo, nombre: s.perfil.nombre }
        : null,
      usuario: s.usuario
        ? {
            id: s.usuario.id,
            login: s.usuario.login,
            nombres: s.usuario.nombres,
            apellidos: s.usuario.apellidos,
          }
        : null,
    };
  }

  async findAll(q: SesionQueryDto) {
    const where: FindOptionsWhere<Sesion> = {};
    if (q.activas) Object.assign(where, { estado: true, fechaFin: IsNull() });
    if (q.prsn_id) where.prsn_id = q.prsn_id;
    const sesiones = await this.repository.find({
      where,
      relations: { perfil: true, usuario: true },
      order: { fechaInicio: 'DESC' },
      take: 500,
    });
    return {
      message: q.activas ? 'Sesiones activas' : 'Bitácora de sesiones',
      data: sesiones.map((s) => this.resumir(s)),
    };
  }

  async findOne(id: number) {
    const s = await this.repository.findOne({
      where: { id },
      relations: { perfil: true, usuario: true },
    });
    if (!s)
      throw new NotFoundException(`No existe la sesión con sesn_id=${id}`);
    return { message: `Sesión con sesn_id=${id}`, data: this.resumir(s) };
  }

  /** Cierre forzado por el administrador: el token de esa sesión deja de servir. */
  async cerrar(id: number) {
    const s = await this.repository.findOne({ where: { id } });
    if (!s)
      throw new NotFoundException(`No existe la sesión con sesn_id=${id}`);
    if (s.fechaFin)
      return {
        message: 'La sesión ya estaba cerrada',
        data: { id, fin: s.fechaFin },
      };
    s.fechaFin = new Date();
    s.estado = false;
    await this.repository.save(s);
    return {
      message: `Sesión ${id} cerrada por el administrador`,
      data: { id, fin: s.fechaFin },
    };
  }
}
