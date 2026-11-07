import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';
import { Sesion } from '../seguridad/sesion/entities/sesion.entity';
import { PersonaPerfil } from '../seguridad/persona/entities/persona-perfil.entity';
import * as bcrypt from 'bcrypt';
import type { UsuarioToken } from '../common/decorators/usuario-actual.decorator';
import { RbacService } from '../seguridad/rbac/rbac.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
    @InjectRepository(PersonaPerfil)
    private readonly prpfRepo: Repository<PersonaPerfil>,
    private readonly jwtService: JwtService,
    private readonly rbac: RbacService,
  ) {}

  /**
   * El perfil de la sesión debe estar asignado al usuario en seguridad.prpf.
   * Si el cliente no indica prfl_id se usa el primero asignado (menor prfl_id).
   */
  private async resolverPerfil(prsnId: number, prflId?: number) {
    const asignados = await this.prpfRepo.find({
      where: { prsn_id: prsnId, estado: true },
      order: { prfl_id: 'ASC' },
    });
    const activos = asignados.filter((a) => a.perfil?.estado);
    if (!activos.length) {
      throw new ForbiddenException(
        'El usuario no tiene perfiles institucionales activos asignados. Contacte al administrador.',
      );
    }
    if (prflId === undefined)
      return { asignacion: activos[0], disponibles: activos };
    const elegido = activos.find((a) => a.prfl_id === prflId);
    if (!elegido) {
      throw new ForbiddenException(
        `El perfil prfl_id=${prflId} no está asignado a este usuario. Perfiles disponibles: ${activos
          .map((a) => `${a.prfl_id} (${a.perfil.codigo})`)
          .join(', ')}`,
      );
    }
    return { asignacion: elegido, disponibles: activos };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByLoginOrEmail(loginDto.login);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.estado) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    delete user.password;

    const { asignacion, disponibles } = await this.resolverPerfil(
      user.id,
      loginDto.prfl_id,
    );
    const perfil = asignacion.perfil;

    // Una sola sesión abierta por usuario: se cierran las que quedaron colgadas.
    await this.sesionRepo.update(
      { prsn_id: user.id, fechaFin: IsNull() },
      { fechaFin: new Date(), estado: false },
    );

    // Tarea 3.3: registro de la sesión activa (sesnfcin).
    const sesion = await this.sesionRepo.save(
      this.sesionRepo.create({
        prsn_id: user.id,
        prfl_id: perfil.id,
        prpf_id: asignacion.id,
        fechaInicio: new Date(),
        fechaFin: null,
        estado: true,
      }),
    );

    // Firma de JWT real criptográfico con datos de sesión
    const payload = {
      sub: user.id,
      username: user.login,
      email: user.correo,
      prfl_id: perfil.id,
      rol: perfil.nombre,
      rol_codigo: perfil.codigo,
      sesion_id: sesion.id,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login exitoso',
      data: {
        token,
        sesion: { id: sesion.id, inicio: sesion.fechaInicio },
        perfil: { id: perfil.id, codigo: perfil.codigo, nombre: perfil.nombre },
        perfilesDisponibles: disponibles.map((a) => ({
          id: a.perfil.id,
          codigo: a.perfil.codigo,
          nombre: a.perfil.nombre,
        })),
        user,
      },
    };
  }

  /** Tarea 3.3: cierre de sesión (sesnfcfn). Cierra la sesión del propio token. */
  async logout(usuario: UsuarioToken, dto: LogoutDto) {
    const sesionId = Number(usuario.sesion_id);
    if (dto.sesionId !== undefined && dto.sesionId !== sesionId) {
      throw new ForbiddenException(
        'Solo puede cerrar su propia sesión. Para cerrar otra use PATCH /sesion/:id/cerrar (ADM).',
      );
    }
    const sesion = await this.sesionRepo.findOne({
      where: { id: sesionId, prsn_id: usuario.sub },
    });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    if (sesion.fechaFin) {
      return { message: 'La sesión ya estaba cerrada', data: sesion };
    }

    sesion.fechaFin = new Date();
    sesion.estado = false;
    await this.sesionRepo.save(sesion);

    return {
      message: 'Sesión cerrada correctamente. El token ya no es válido.',
      data: sesion,
    };
  }

  /** Datos del usuario autenticado y acciones que su perfil puede ejecutar (para menús del frontend). */
  async me(usuario: UsuarioToken) {
    const user = await this.usersService.findById(usuario.sub);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    delete user.password;
    const sesion = await this.sesionRepo.findOne({
      where: { id: usuario.sesion_id },
    });
    return {
      message: 'Usuario autenticado',
      data: {
        user,
        perfil: {
          id: usuario.prfl_id,
          codigo: usuario.rol_codigo,
          nombre: usuario.rol,
        },
        sesion: sesion ? { id: sesion.id, inicio: sesion.fechaInicio } : null,
        acciones: await this.rbac.accionesDePerfil(usuario.prfl_id),
      },
    };
  }

  async changePassword(usuario: UsuarioToken, dto: ChangePasswordDto) {
    if (dto.userId !== undefined && dto.userId !== usuario.sub) {
      throw new ForbiddenException(
        'Solo puede cambiar su propia contraseña. Para otro usuario use PATCH /users/:id (ADM).',
      );
    }
    const user = await this.usersService.findById(usuario.sub);

    if (!user || !user.password) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser distinta de la actual',
      );
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.changePassword(usuario.sub, hash);

    return {
      message: 'Contraseña actualizada correctamente',
      data: { id: usuario.sub },
    };
  }
}
