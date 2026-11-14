import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status UP', () => {
      const res = appController.getHello();
      expect(res.status).toBe('UP');
      expect(res.service).toBe('UZDI Backend API');
    });

    it('should return health status UP on /health', () => {
      const res = appController.getHealth();
      expect(res.status).toBe('UP');
    });
  });
});
