import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByLoginOrEmail(loginDto.login);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    delete user.password;

    return {
      message: 'Login exitoso',
      token: 'mock-jwt-token-generado-por-la-app',
      user
    };
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
