import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// Módulos UZDI
import { EstructuraInstitucionalModule } from './estructura-institucional/estructura-institucional.module';
import { SeguridadModule } from './seguridad/seguridad.module';
import { AdolescentesModule } from './adolescente/adolescente.module';
import { ContextoFamiliarModule } from './contexto-familiar/contexto-familiar.module';
import { TalleresActividadesModule } from './talleres-actividades/talleres-actividades.module';
import { GestionDocumentalModule } from './gestion-documental/gestion-documental.module';
import { AuditContextMiddleware } from './common/middleware/audit-context.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      // El esquema físico lo gobierna Back Ecologia (1).sql (DDL v8); TypeORM no debe alterarlo automáticamente.
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    EstructuraInstitucionalModule,
    SeguridadModule,
    AdolescentesModule,
    ContextoFamiliarModule,
    TalleresActividadesModule,
    GestionDocumentalModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditContextMiddleware)
      .forRoutes('*');
  }
}
