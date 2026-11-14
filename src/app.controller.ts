import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Verificación de estado de la API' })
  getHello() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'UZDI Backend API',
      version: '1.0.0',
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Endpoint explícito de health check' })
  getHealth() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'UZDI Backend API',
      version: '1.0.0',
    };
  }
}
