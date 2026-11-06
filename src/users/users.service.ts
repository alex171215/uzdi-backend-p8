import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
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

  /**
   * RF-12 → RF-01: el perfil institucional (tipo_persona) debe existir y
   * estar activo ANTES de dar de alta al usuario.
   */
  private async validarPerfilInstitucional(tpprId: number): Promise<TipoPersona> {
    const tipo = await this.tipoPersonaRepo.findOne({ where: { id: tpprId } });
    if (!tipo) {
      throw new BadRequestException(
        `El perfil institucional (tppr_id=${tpprId}) no existe. Regístrelo primero (RF-12).`,
      );
    }
    if (!tipo.estado) {
      throw new BadRequestException(`El perfil institucional "${tipo.nombre}" está inactivo.`);
    }
    return tipo;
  }

  async create(createUserDto: CreateUserDto) {
    const tipoPersona = await this.validarPerfilInstitucional(createUserDto.tppr_id);

    const existingUser = await this.userRepository.findOne({
      where: [{ login: createUserDto.login }, { correo: createUserDto.correo }],
    });
    if (existingUser) {
      throw new ConflictException('El login o correo ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      tipoPersona,
      estado: true,
    });

    const savedUser = await this.userRepository.save(newUser);
    delete savedUser.password;

    return {
      message: 'Usuario registrado correctamente',
      data: savedUser,
    };
  }

  /** Solo usuarios activos (estado = 'V'). */
  async findAll() {
    const users = await this.userRepository.find({
      where: { estado: true },
      order: { apellidos: 'ASC' },
    });
    return {
      message: 'Listado general de usuarios',
      data: users,
    };
  }

  async search(query: string) {
    const q = `%${query ?? ''}%`;
    const users = await this.userRepository.find({
      where: [
        { estado: true, nombres: ILike(q) },
        { estado: true, apellidos: ILike(q) },
        { estado: true, login: ILike(q) },
        { estado: true, correo: ILike(q) },
      ],
    });

    return {
      message: `Resultados de búsqueda para: ${query}`,
      data: users,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return {
      message: `Usuario con ID ${id}`,
      data: user,
    };
  }

  /** Uso interno (AuthService): incluye el hash de la contraseña. */
  async findByLoginOrEmail(login: string) {
    return this.userRepository
      .createQueryBuilder('u')
      .addSelect('u.password')
      .leftJoinAndSelect('u.tipoPersona', 'tp')
      .where('u.login = :login OR u.correo = :login', { login })
      .getOne();
  }

  /** Uso interno (AuthService): incluye el hash de la contraseña. */
  async findById(id: number) {
    return this.userRepository
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.id = :id', { id })
      .getOne();
  }

  async changePassword(userId: number, newPasswordHash: string) {
    await this.userRepository.update(userId, { password: newPasswordHash });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (updateUserDto.tppr_id !== undefined) {
      user.tipoPersona = await this.validarPerfilInstitucional(updateUserDto.tppr_id);
      user.tppr_id = updateUserDto.tppr_id;
    }

    const { tppr_id: _t, password, ...fields } = updateUserDto;
    Object.assign(user, fields);
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await this.userRepository.save(user);
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    return {
      message: 'Información del usuario actualizada',
      data: updatedUser,
    };
  }

  /** Borrado lógico: estado = 'F' (el trigger deja el rastro en seguridad.historial). */
  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.userRepository.update(id, { estado: false });

    return {
      message: `Usuario con ID ${id} desactivado exitosamente`,
      data: { id, estado: false },
    };
  }
}
