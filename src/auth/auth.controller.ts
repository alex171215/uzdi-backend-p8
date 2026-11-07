import { Controller, Post, Body, Get, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { Public } from '../common/decorators/public.decorator';
import {
  UsuarioActual,
  type UsuarioToken,
} from '../common/decorators/usuario-actual.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT de acceso' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso con token JWT y datos de sesión',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o usuario inactivo',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Usuario autenticado, su perfil y las acciones que puede ejecutar',
  })
  me(@UsuarioActual() usuario: UsuarioToken) {
    return this.authService.me(usuario);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cerrar sesión activa en seguridad.sesn' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  logout(@UsuarioActual() usuario: UsuarioToken, @Body() dto: LogoutDto) {
    return this.authService.logout(usuario, dto);
  }

  @Post('change-password')
  @HttpCode(200)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cambiar contraseña de usuario' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  changePassword(
    @UsuarioActual() usuario: UsuarioToken,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(usuario, dto);
  }
}
