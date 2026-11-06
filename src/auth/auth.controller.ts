import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT de acceso' })
  @ApiResponse({ status: 200, description: 'Login exitoso con token JWT y datos de sesión' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o usuario inactivo' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión activa en seguridad.sesn' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Cambiar contraseña de usuario' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }
}
