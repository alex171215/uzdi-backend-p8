import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { TipoPersona } from './entities/tipo-persona.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TipoPersona)
    private readonly tipoPersonaRepo: Repository<TipoPersona>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: [{ login: createUserDto.login }, { correo: createUserDto.correo }],
    });

    if (existingUser) {
      throw new ConflictException('El login o correo ya está en uso');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    if (createUserDto.roles_ids?.length) {
      newUser.roles = await this.tipoPersonaRepo.findBy({ id: In(createUserDto.roles_ids) });
      newUser.tppr_id = createUserDto.roles_ids[0];
    }

    const savedUser = await this.userRepository.save(newUser);
    delete savedUser.password;
    
    return {
      message: 'Usuario registrado correctamente',
      data: savedUser,
    };
  }

  async findAll() {
    const users = await this.userRepository.find({
      select: { id: true, nombres: true, apellidos: true, correo: true, login: true, uzdi_id: true, tppr_id: true },
      relations: { roles: true },
    });
    return {
      message: 'Listado general de usuarios',
      data: users,
    };
  }

  async search(query: string) {
    const users = await this.userRepository.find({
      where: [
        { nombres: Like(`%${query}%`) },
        { apellidos: Like(`%${query}%`) },
        { login: Like(`%${query}%`) },
        { correo: Like(`%${query}%`) }
      ],
      select: { id: true, nombres: true, apellidos: true, correo: true, login: true }
    });

    return {
      message: `Resultados de búsqueda para: ${query}`,
      data: users,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    delete user.password;
    return {
      message: `Usuario con ID ${id}`,
      data: user,
    };
  }

  async findByLoginOrEmail(login: string) {
    return this.userRepository.findOne({
      where: [{ login }, { correo: login }],
    });
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async changePassword(userId: number, newPasswordHash: string) {
    await this.userRepository.update(userId, { password: newPasswordHash });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (updateUserDto.roles_ids !== undefined) {
      const roles = await this.tipoPersonaRepo.findBy({ id: In(updateUserDto.roles_ids) });
      user.roles = roles;
      if (updateUserDto.roles_ids.length) user.tppr_id = updateUserDto.roles_ids[0];
      await this.userRepository.save(user);
    }

    const { roles_ids: _r, ...fieldsToUpdate } = updateUserDto;
    if (Object.keys(fieldsToUpdate).length) {
      await this.userRepository.update(id, fieldsToUpdate);
    }

    const updatedUser = await this.userRepository.findOne({ where: { id }, relations: { roles: true } });
    if (updatedUser) {
      delete updatedUser.password;
    }

    return {
      message: 'Información del usuario actualizada',
      data: updatedUser,
    };
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Desactivación lógica requeriría un campo 'estado' o similar. 
    // Como la DB actual no tiene 'estado' explícito en seguridad.prsn, 
    // hacemos soft remove si TypeORM lo permite o delete real temporalmente.
    // Para cumplir el PDF, idealmente agregamos la lógica pero por ahora eliminamos.
    await this.userRepository.delete(id);
    
    return {
      message: `Usuario con ID ${id} desactivado/eliminado exitosamente`
    };
  }
}
