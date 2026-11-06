import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { Sesion } from '../seguridad/sesion/entities/sesion.entity';
import { Perfil } from '../seguridad/perfil/entities/perfil.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Sesion, Perfil]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super_secret_snai_uzdi_jwt_key_2026_puce',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
