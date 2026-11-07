import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TipoPersona } from './entities/tipo-persona.entity';
import { PersonaPerfil } from '../seguridad/persona/entities/persona-perfil.entity';
import { Perfil } from '../seguridad/perfil/entities/perfil.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TipoPersona, PersonaPerfil, Perfil]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
