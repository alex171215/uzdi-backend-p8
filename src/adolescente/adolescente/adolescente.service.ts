import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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
      return this.findAll();
    }
    const q = `%${query.trim()}%`;
    return this.repository.find({
      where: [
        { nombre: ILike(q), estado: true },
        { apellido: ILike(q), estado: true },
        { cedula: ILike(q), estado: true },
      ],
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id, estado: true } });
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
