import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { Permiso } from './entities/permiso.entity';

@Injectable()
export class PermisoService {
  constructor(
    @InjectRepository(Permiso)
    private readonly repository: Repository<Permiso>,
  ) {}

  create(createPermisoDto: CreatePermisoDto) {
    const newEntity = this.repository.create(createPermisoDto);
    return this.repository.save(newEntity);
  }

  findAll() {
    return this.repository.find({ where: { estado: true } as any });
  }

  findOne(id: number) {
    return this.repository.findOne({ where: { id } as any });
  }

  update(id: number, updatePermisoDto: UpdatePermisoDto) {
    return this.repository.update(id, updatePermisoDto);
  }

  remove(id: number) {
    // Borrado lógico (DDL v8): estado = 'F'
    return this.repository.update(id, { estado: false } as any);
  }
}
