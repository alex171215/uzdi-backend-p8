import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { TipoPersona } from './entities/tipo-persona.entity';
import { PersonaPerfil } from '../seguridad/persona/entities/persona-perfil.entity';
import { Perfil } from '../seguridad/perfil/entities/perfil.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TipoPersona)
    private readonly tipoPersonaRepo: Repository<TipoPersona>,
    @InjectRepository(PersonaPerfil)
    private readonly prpfRepo: Repository<PersonaPerfil>,
    @InjectRepository(Perfil)
    private readonly perfilRepo: Repository<Perfil>,
  ) {}

  /** RF-12: todos los perfiles a asignar deben existir y estar activos. */
  private async validarPerfiles(perfilesIds: number[]): Promise<Perfil[]> {
    const ids = [...new Set(perfilesIds)];
    const perfiles = await this.perfilRepo.find({
      where: { id: In(ids), estado: true },
    });
    const encontrados = new Set(perfiles.map((p) => p.id));
    const faltantes = ids.filter((id) => !encontrados.has(id));
    if (faltantes.length) {
      throw new BadRequestException(
        `Perfiles inexistentes o inactivos (prfl_id): ${faltantes.join(', ')}. Regístrelos primero (RF-12).`,
      );
    }
    return perfiles;
  }

  /** Deja al usuario exactamente con estos perfiles (activa, reactiva o desactiva en seguridad.prpf). */
  private async sincronizarPerfiles(prsnId: number, perfilesIds: number[]) {
    const deseados = new Set(perfilesIds);
    const actuales = await this.prpfRepo.find({ where: { prsn_id: prsnId } });
    for (const a of actuales) {
      const debeEstar = deseados.has(a.prfl_id);
      if (a.estado !== debeEstar)
        await this.prpfRepo.update(a.id, { estado: debeEstar });
      deseados.delete(a.prfl_id);
    }
    for (const prflId of deseados) {
      await this.prpfRepo.save(
        this.prpfRepo.create({
          prsn_id: prsnId,
          prfl_id: prflId,
          estado: true,
        }),
      );
    }
  }

  /** Perfiles activos asignados a un usuario. */
  async perfilesAsignados(prsnId: number): Promise<Perfil[]> {
    const filas = await this.prpfRepo.find({
      where: { prsn_id: prsnId, estado: true },
      order: { prfl_id: 'ASC' },
    });
    return filas.map((f) => f.perfil).filter((p) => p?.estado);
  }

  async listarPerfiles(prsnId: number) {
    const user = await this.userRepository.findOne({ where: { id: prsnId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const perfiles = await this.perfilesAsignados(prsnId);
    return {
      message: `Perfiles asignados a ${user.login}`,
      data: perfiles.map((p) => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
      })),
    };
  }

  async asignarPerfiles(prsnId: number, perfilesIds: number[]) {
    const user = await this.userRepository.findOne({ where: { id: prsnId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await this.validarPerfiles(perfilesIds);
    await this.sincronizarPerfiles(prsnId, perfilesIds);
    return this.listarPerfiles(prsnId);
  }

  /**
   * RF-12 → RF-01: el perfil institucional (tipo_persona) debe existir y
   * estar activo ANTES de dar de alta al usuario.
   */
  private async validarPerfilInstitucional(
    tpprId: number,
  ): Promise<TipoPersona> {
    const tipo = await this.tipoPersonaRepo.findOne({ where: { id: tpprId } });
    if (!tipo) {
      throw new BadRequestException(
        `El perfil institucional (tppr_id=${tpprId}) no existe. Regístrelo primero (RF-12).`,
      );
    }
    if (!tipo.estado) {
      throw new BadRequestException(
        `El perfil institucional "${tipo.nombre}" está inactivo.`,
      );
    }
    return tipo;
  }

  async create(createUserDto: CreateUserDto) {
    const tipoPersona = await this.validarPerfilInstitucional(
      createUserDto.tppr_id,
    );
    const perfiles = await this.validarPerfiles(createUserDto.perfiles_ids);

    const existingUser = await this.userRepository.findOne({
      where: [{ login: createUserDto.login }, { correo: createUserDto.correo }],
    });
    if (existingUser) {
      throw new ConflictException('El login o correo ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const datos: Partial<CreateUserDto> = { ...createUserDto };
    delete datos.perfiles_ids;
    const newUser = this.userRepository.create({
      ...datos,
      password: hashedPassword,
      tipoPersona,
      estado: true,
    });

    const savedUser = await this.userRepository.save(newUser);
    delete savedUser.password;
    await this.sincronizarPerfiles(
      savedUser.id,
      perfiles.map((p) => p.id),
    );

    return {
      message: 'Usuario registrado correctamente',
      data: {
        ...savedUser,
        perfiles: perfiles.map((p) => ({
          id: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
        })),
      },
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
      user.tipoPersona = await this.validarPerfilInstitucional(
        updateUserDto.tppr_id,
      );
      user.tppr_id = updateUserDto.tppr_id;
    }

    if (updateUserDto.perfiles_ids !== undefined) {
      await this.validarPerfiles(updateUserDto.perfiles_ids);
      await this.sincronizarPerfiles(id, updateUserDto.perfiles_ids);
    }

    const { password, ...fields }: UpdateUserDto = updateUserDto;
    delete fields.tppr_id;
    delete fields.perfiles_ids;
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
  async remove(id: number, usuarioActualId?: number) {
    if (id === usuarioActualId) {
      throw new BadRequestException('No puede desactivar su propio usuario');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.userRepository.update(id, { estado: false });

    return {
      message: `Usuario con ID ${id} desactivado exitosamente`,
      data: { id, estado: false },
    };
  }
}
