import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';
import { Sesion } from '../seguridad/sesion/entities/sesion.entity';
import { Perfil } from '../seguridad/perfil/entities/perfil.entity';
import * as bcrypt from 'bcrypt';

/** Perfil por defecto si el cliente no indica uno: 'CONS' (solo lectura). */
const PERFIL_POR_DEFECTO = 'CONS';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
    @InjectRepository(Perfil)
    private readonly perfilRepo: Repository<Perfil>,
  ) {}

  private async resolverPerfil(prflId?: number): Promise<Perfil> {
    const perfil = prflId
      ? await this.perfilRepo.findOne({ where: { id: prflId } })
      : await this.perfilRepo.findOne({ where: { codigo: PERFIL_POR_DEFECTO } });

    if (!perfil) throw new BadRequestException('El perfil indicado no existe');
    if (!perfil.estado) throw new BadRequestException(`El perfil "${perfil.nombre}" está inactivo`);
    return perfil;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByLoginOrEmail(loginDto.login);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.estado) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    delete user.password;

    const perfil = await this.resolverPerfil(loginDto.prfl_id);

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
        fechaInicio: new Date(),
        fechaFin: null,
        estado: true,
      }),
    );

    return {
      message: 'Login exitoso',
      data: {
        token: 'mock-jwt-token-generado-por-la-app', // TODO: reemplazar por JWT real
        sesion: { id: sesion.id, inicio: sesion.fechaInicio },
        perfil: { id: perfil.id, codigo: perfil.codigo, nombre: perfil.nombre },
        user,
      },
    };
  }

  /** Tarea 3.3: cierre de sesión (sesnfcfn). */
  async logout(dto: LogoutDto) {
    const sesion = await this.sesionRepo.findOne({ where: { id: dto.sesionId } });
    if (!sesion) throw new NotFoundException('Sesión no encontrada');
    if (sesion.fechaFin) {
      return { message: 'La sesión ya estaba cerrada', data: sesion };
    }

    sesion.fechaFin = new Date();
    sesion.estado = false;
    await this.sesionRepo.save(sesion);

    return { message: 'Sesión cerrada correctamente', data: sesion };
  }

  async changePassword(dto: ChangePasswordDto) {
    const user = await this.usersService.findById(dto.userId);

    if (!user || !user.password) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.changePassword(dto.userId, hash);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
