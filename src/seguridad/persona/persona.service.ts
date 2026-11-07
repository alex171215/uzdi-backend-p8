import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';

/**
 * seguridad.prsn en modo consulta. El alta, edición y baja de personas se
 * hace por /users, que aplica la precedencia RF-12 → RF-01 y el hash de clave.
 */
@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona) private readonly repository: Repository<Persona>,
  ) {}

  async findAll() {
    const data = await this.repository.find({
      where: { estado: true },
      order: { apellidos: 'ASC' },
    });
    return { message: 'Personas activas del sistema', data };
  }

  async findOne(id: number) {
    const data = await this.repository.findOne({ where: { id } });
    if (!data)
      throw new NotFoundException(`No existe la persona con prsn_id=${id}`);
    return { message: `Persona con prsn_id=${id}`, data };
  }
}
