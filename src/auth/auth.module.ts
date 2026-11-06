import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { Sesion } from '../seguridad/sesion/entities/sesion.entity';
import { Perfil } from '../seguridad/perfil/entities/perfil.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Sesion, Perfil])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
