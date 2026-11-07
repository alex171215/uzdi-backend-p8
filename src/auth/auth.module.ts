import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { Sesion } from '../seguridad/sesion/entities/sesion.entity';
import { PersonaPerfil } from '../seguridad/persona/entities/persona-perfil.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Sesion, PersonaPerfil]),
    // registerAsync: el secreto se lee cuando ConfigModule ya cargó el .env.
    // Con register() se leía al importar el archivo, antes del .env, y el token
    // se firmaba con la clave por defecto pero se verificaba con la del .env (401).
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
          throw new Error(
            'JWT_SECRET es obligatorio en producción (ver docs/GUIA_DESPLIEGUE_LINUX.md)',
          );
        }
        return {
          secret:
            process.env.JWT_SECRET ||
            'super_secret_snai_uzdi_jwt_key_2026_puce',
          signOptions: { expiresIn: '8h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
