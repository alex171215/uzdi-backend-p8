import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RepresentanteService } from './representante.service';
import { Representante } from './entities/representante.entity';
import { Canton } from '../../estructura-institucional/canton/entities/canton.entity';

describe('RepresentanteService', () => {
  let service: RepresentanteService;

  const mockRepresentanteRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) =>
      Promise.resolve({ id: 1, ...entity }),
    ),
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockCantonRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepresentanteService,
        {
          provide: getRepositoryToken(Representante),
          useValue: mockRepresentanteRepo,
        },
        {
          provide: getRepositoryToken(Canton),
          useValue: mockCantonRepo,
        },
      ],
    }).compile();

    service = module.get<RepresentanteService>(RepresentanteService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('creación de representante', () => {
    it('debe crear un representante si el cantón existe y la cédula es única', async () => {
      mockCantonRepo.findOne.mockResolvedValue({ id: 1, estado: true });
      mockRepresentanteRepo.findOne.mockResolvedValue(null);

      const dto = {
        cntn_id: 1,
        nombre: 'Rosa María',
        apellido: 'Pérez Gómez',
        cedula: '1801234567',
        telefono: '0991234567',
      };

      const result = await service.create(dto);
      expect(result).toHaveProperty('id', 1);
      expect(result.cedula).toBe('1801234567');
    });

    it('debe lanzar ConflictException si la cédula ya existe', async () => {
      mockCantonRepo.findOne.mockResolvedValue({ id: 1, estado: true });
      mockRepresentanteRepo.findOne.mockResolvedValue({
        id: 2,
        cedula: '1801234567',
        estado: true,
      });

      const dto = {
        cntn_id: 1,
        nombre: 'Rosa María',
        apellido: 'Pérez Gómez',
        cedula: '1801234567',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('borrado lógico', () => {
    it('debe actualizar estado = false', async () => {
      mockRepresentanteRepo.update.mockResolvedValue({ affected: 1 });

      const res = await service.remove(1);
      expect(mockRepresentanteRepo.update).toHaveBeenCalledWith(
        { id: 1, estado: true },
        { estado: false },
      );
      expect(res).toHaveProperty('message');
    });
  });
});

