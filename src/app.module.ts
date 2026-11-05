import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// Modulos UZDI Scaffoldeados
import { EstructuraInstitucionalModule } from './estructura-institucional/estructura-institucional.module';
import { SeguridadModule } from './seguridad/seguridad.module';
import { AdolescentesModule } from './adolescente/adolescente.module';
import { ContextoFamiliarModule } from './contexto-familiar/contexto-familiar.module';
import { TalleresActividadesModule } from './talleres-actividades/talleres-actividades.module';
import { GestionDocumentalModule } from './gestion-documental/gestion-documental.module';
import { MockAuthMiddleware } from './common/middleware/mock-auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      // El esquema lo gobierna DDL_UZDI_FINAL.sql; TypeORM no debe alterarlo.
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    EstructuraInstitucionalModule,
    SeguridadModule,
    AdolescentesModule,
    ContextoFamiliarModule,
    TalleresActividadesModule,
    GestionDocumentalModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MockAuthMiddleware).forRoutes('*');
  }
}
