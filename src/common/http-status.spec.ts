import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  INestApplication,
  NotFoundException,
  Post,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsNotEmpty, IsString } from 'class-validator';
import * as request from 'supertest';
import type { Server } from 'node:http';
import { QueryFailedError } from 'typeorm';
import { CustomHttpExceptionFilter } from './filters/http-exception.filter';
import { ResponseTransformInterceptor } from './interceptors/transform.interceptor';

class CreateProbeDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

@Controller('status-probe')
class StatusProbeController {
  @Get()
  ok() {
    return { id: 1 };
  }

  @Post()
  created(@Body() dto: CreateProbeDto) {
    return { id: 2, nombre: dto.nombre };
  }

  @Get('unauthorized')
  unauthorized() {
    throw new UnauthorizedException('Token inválido');
  }

  @Get('forbidden')
  forbidden() {
    throw new ForbiddenException('Perfil sin permiso');
  }

  @Get('missing')
  missing() {
    throw new NotFoundException('Registro no encontrado');
  }

  @Get('duplicate')
  duplicate() {
    throw new QueryFailedError(
      'INSERT',
      [],
      Object.assign(new Error('duplicado'), {
        code: '23505',
        detail: 'Key (nombre)=(Duplicado) already exists.',
      }),
    );
  }

  @Get('unexpected')
  unexpected() {
    throw new Error('Detalle interno sensible');
  }
}

describe('Contrato HTTP global', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [StatusProbeController],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.useGlobalFilters(new CustomHttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('devuelve 200 y 201 con contrato de éxito', async () => {
    const server = app.getHttpServer() as Server;
    const ok = await request(server).get('/status-probe').expect(200);
    expect(ok.body).toMatchObject({ ok: true, data: { id: 1 } });
    const created = await request(server)
      .post('/status-probe')
      .send({ nombre: 'Prueba' })
      .expect(201);
    expect(created.body).toMatchObject({
      ok: true,
      data: { id: 2, nombre: 'Prueba' },
    });
  });

  it('devuelve 400 con el campo que falló', async () => {
    const res = await request(app.getHttpServer() as Server)
      .post('/status-probe')
      .send({})
      .expect(400);
    expect(res.body).toMatchObject({
      ok: false,
      statusCode: 400,
      message: 'Error de validación en la solicitud',
    });
    const body = res.body as { errors: string[] };
    expect(body.errors.join(' ')).toContain('nombre');
  });

  it.each([
    ['unauthorized', 401, 'Token inválido'],
    ['forbidden', 403, 'Perfil sin permiso'],
    ['missing', 404, 'Registro no encontrado'],
    ['duplicate', 409, 'Ya existe un registro con nombre'],
  ])('%s devuelve %i', async (route, status, message) => {
    const res = await request(app.getHttpServer() as Server)
      .get('/status-probe/' + route)
      .expect(status);
    expect(res.body).toMatchObject({ ok: false, statusCode: status });
    const body = res.body as { message: string };
    expect(body.message).toContain(message);
  });

  it('controla el 500 sin revelar el error interno al cliente', async () => {
    const res = await request(app.getHttpServer() as Server)
      .get('/status-probe/unexpected')
      .expect(500);
    expect(res.body).toMatchObject({
      ok: false,
      statusCode: 500,
      message: 'Error interno del servidor',
    });
    expect(JSON.stringify(res.body)).not.toContain('Detalle interno sensible');
  });
});
