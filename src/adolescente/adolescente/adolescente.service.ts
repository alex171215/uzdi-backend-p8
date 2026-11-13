import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdolescenteDto } from './dto/create-adolescente.dto';
import { UpdateAdolescenteDto } from './dto/update-adolescente.dto';
import { Adolescente } from './entities/adolescente.entity';

@Injectable()
export class AdolescenteService {
  constructor(
    @InjectRepository(Adolescente)
    private readonly repository: Repository<Adolescente>,
  ) {}

  create(createAdolescenteDto: CreateAdolescenteDto) {
    const newEntity = this.repository.create(createAdolescenteDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find({
      where: { estado: true },
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
  }

  async search(query: string) {
    if (!query || !query.trim()) {
      throw new BadRequestException('El parámetro q es obligatorio');
    }
    // Búsqueda sin distinguir mayúsculas ni tildes: "perez" encuentra "Pérez".
    const q = `%${query.trim()}%`;
    const sinTildes = (col: string) =>
      `translate(lower(${col}), 'áéíóúüñ', 'aeiouun')`;
    return this.repository
      .createQueryBuilder('a')
      .where('a.estado = :activo', { activo: 'V' })
      .andWhere(
        `(${sinTildes('a.nombre')} LIKE ${sinTildes(':q')}
          OR ${sinTildes('a.apellido')} LIKE ${sinTildes(':q')}
          OR ${sinTildes("a.nombre || ' ' || a.apellido")} LIKE ${sinTildes(':q')}
          OR lower(a.cedula) LIKE lower(:q))`,
        { q },
      )
      .orderBy('a.apellido', 'ASC')
      .addOrderBy('a.nombre', 'ASC')
      .getMany();
  }

  async findOne(id: number) {
    const adolescente = await this.repository.findOne({
      where: { id, estado: true },
    });
    if (!adolescente)
      throw new NotFoundException('Adolescente activo no encontrado');
    return adolescente;
  }

  async update(id: number, updateAdolescenteDto: UpdateAdolescenteDto) {
    const result = await this.repository.update(
      { id, estado: true },
      updateAdolescenteDto,
    );
    if (!result.affected)
      throw new NotFoundException('Adolescente activo no encontrado');
    return result;
  }

  async remove(id: number) {
    const result = await this.repository.update(
      { id, estado: true },
      { estado: false },
    );
    if (!result.affected)
      throw new NotFoundException('Adolescente activo no encontrado');
    return result;
  }
}
