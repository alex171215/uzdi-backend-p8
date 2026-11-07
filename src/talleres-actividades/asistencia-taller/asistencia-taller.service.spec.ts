import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AsistenciaTallerService } from './asistencia-taller.service';
import { AsistenciaTaller } from './entities/asistencia-taller.entity';
import { Taller } from '../taller/entities/taller.entity';
import { Adolescente } from '../../adolescente/adolescente/entities/adolescente.entity';
import { AdolescenteRepresentante } from '../../contexto-familiar/adolescente-representante/entities/adolescente-representante.entity';

describe('AsistenciaTallerService', () => {
  let service: AsistenciaTallerService;

  const mockAsistenciaRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) =>
      Promise.resolve({ id: 1, ...entity }),
    ),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockTallerRepo = {
    findOne: jest.fn(),
  };

  const mockAdolescenteRepo = {
    findOne: jest.fn(),
  };

  const mockAdreRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsistenciaTallerService,
        {
          provide: getRepositoryToken(AsistenciaTaller),
          useValue: mockAsistenciaRepo,
        },
        {
          provide: getRepositoryToken(Taller),
          useValue: mockTallerRepo,
        },
        {
          provide: getRepositoryToken(Adolescente),
          useValue: mockAdolescenteRepo,
        },
        {
          provide: getRepositoryToken(AdolescenteRepresentante),
          useValue: mockAdreRepo,
        },
      ],
    }).compile();

    service = module.get<AsistenciaTallerService>(AsistenciaTallerService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validación de restricción de asistente', () => {
    it('debe registrar asistencia exitosa para un adolescente', async () => {
      mockTallerRepo.findOne.mockResolvedValue({ id: 1, estado: true });
      mockAdolescenteRepo.findOne.mockResolvedValue({ id: 10, estado: true });

      const dto = {
        tall_id: 1,
        tipo_asistente: 'adolescente' as const,
        adlc_id: 10,
        asistio: true,
      };

      const result = await service.create(dto);
      expect(result).toHaveProperty('id', 1);
      expect(result.tipo_asistente).toBe('adolescente');
      expect(result.adlc_id).toBe(10);
      expect(result.adre_id).toBeUndefined();
    });

    it('debe fallar si tipo_asistente es adolescente pero se envía adre_id', async () => {
      const dto = {
        tall_id: 1,
        tipo_asistente: 'adolescente' as const,
        adlc_id: 10,
        adre_id: 5,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('debe registrar asistencia exitosa para un representante', async () => {
      mockTallerRepo.findOne.mockResolvedValue({ id: 1, estado: true });
      mockAdreRepo.findOne.mockResolvedValue({ id: 5, estado: true });

      const dto = {
        tall_id: 1,
        tipo_asistente: 'representante' as const,
        adre_id: 5,
        asistio: true,
      };

      const result = await service.create(dto);
      expect(result).toHaveProperty('id', 1);
      expect(result.tipo_asistente).toBe('representante');
      expect(result.adre_id).toBe(5);
    });

    it('debe fallar si tipo_asistente es representante pero se envía adlc_id', async () => {
      const dto = {
        tall_id: 1,
        tipo_asistente: 'representante' as const,
        adre_id: 5,
        adlc_id: 10,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('debe fallar si el taller no existe', async () => {
      mockTallerRepo.findOne.mockResolvedValue(null);

      const dto = {
        tall_id: 99,
        tipo_asistente: 'adolescente' as const,
        adlc_id: 10,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('borrado lógico', () => {
    it('debe marcar estado = false al eliminar', async () => {
      mockAsistenciaRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);
      expect(mockAsistenciaRepo.update).toHaveBeenCalledWith(
        { id: 1, estado: true },
        { estado: false },
      );
      expect(result).toHaveProperty('message');
    });

    it('debe lanzar NotFoundException si no existe el registro al eliminar', async () => {
      mockAsistenciaRepo.update.mockResolvedValue({ affected: 0 });

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});

