import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateExpedienteDto } from './expediente/dto/create-expediente.dto';
import { ExpedienteService } from './expediente/expediente.service';
import { Expediente } from './expediente/entities/expediente.entity';
import { Infraccion } from './infraccion/entities/infraccion.entity';
import { Adolescente } from './adolescente/entities/adolescente.entity';
import { Uzdi } from '../estructura-institucional/uzdi/entities/uzdi.entity';
import { CreateMedidaExpedienteDto } from './medida-expediente/dto/create-medida-expediente.dto';
import { MedidaExpedienteService } from './medida-expediente/medida-expediente.service';
import { MedidaExpediente } from './medida-expediente/entities/medida-expediente.entity';
import { MedidaSocioeducativa } from './medida-socioeducativa/entities/medida-socioeducativa.entity';
import { CreateInfraccionDto } from './infraccion/dto/create-infraccion.dto';
import { CreateMedidaSocioeducativaDto } from './medida-socioeducativa/dto/create-medida-socioeducativa.dto';
import { ExpedienteController } from './expediente/expediente.controller';
import { MedidaExpedienteController } from './medida-expediente/medida-expediente.controller';
import { InfraccionController } from './infraccion/infraccion.controller';
import { MedidaSocioeducativaController } from './medida-socioeducativa/medida-socioeducativa.controller';
import { ROLES_KEY } from '../common/decorators/roles.decorator';
import { Rol } from '../common/enums/rol.enum';

// Suite de pruebas del Dominio Judicial y Medidas CONA (Parte 2)
describe('Dominio Judicial y Medidas CONA (Parte 2)', () => {

  // --------------------------------------------------------------------------
  // TAREA 2.1: CRUD Y VALIDACIONES DE EXPEDIENTES
  // --------------------------------------------------------------------------
  describe('Tarea 2.1: Expedientes Judiciales (numero_causa y relaciones)', () => {
    // Probamos que el DTO acepte un numero de causa con formato valido y lo pase a mayusculas
    it('valida y transforma a mayúsculas el número de causa institucional', async () => {
      const dto = plainToInstance(CreateExpedienteDto, {
        adlc_id: 1,
        uzdi_id: 1,
        infc_id: 1,
        numero_causa: 'exp-2026-0042',
      });
      const errores = await validate(dto);
      expect(errores).toHaveLength(0);
      expect(dto.numero_causa).toBe('EXP-2026-0042');
    });

    // Rechazamos numeros de causa con caracteres especiales no permitidos
    it('rechaza número de causa con formato inválido o inyección de caracteres', async () => {
      const dto = plainToInstance(CreateExpedienteDto, {
        adlc_id: 1,
        uzdi_id: 1,
        infc_id: 1,
        numero_causa: 'EXP<script>alert(1)</script>',
      });
      const errores = await validate(dto);
      expect(errores.some((e) => e.property === 'numero_causa')).toBe(true);
    });

    // Si el adolescente no existe o esta inactivo, no se puede abrir el expediente
    it('falla si el adolescente no existe o se encuentra inactivo', async () => {
      const mockAdlcRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      } as unknown as Repository<Adolescente>;

      const service = new ExpedienteService(
        {} as Repository<Expediente>,
        {} as Repository<Infraccion>,
        mockAdlcRepo,
        {} as Repository<Uzdi>,
      );

      await expect(
        service.create({ adlc_id: 999, uzdi_id: 1, infc_id: 1 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    // Si la infraccion no existe o esta dada de baja logica, no se permite crear el expediente
    it('falla si la infracción tipificada no existe o está inactiva', async () => {
      const mockAdlcRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: true }),
      } as unknown as Repository<Adolescente>;
      const mockUzdiRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: true }),
      } as unknown as Repository<Uzdi>;
      const mockInfcRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: false }),
      } as unknown as Repository<Infraccion>;

      const service = new ExpedienteService(
        {} as Repository<Expediente>,
        mockInfcRepo,
        mockAdlcRepo,
        mockUzdiRepo,
      );

      await expect(
        service.create({ adlc_id: 1, uzdi_id: 1, infc_id: 1 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    // Verificamos que no se permita repetir el numero de causa en expedientes activos
    it('rechaza duplicar el número de causa en expedientes activos', async () => {
      const mockAdlcRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: true }),
      } as unknown as Repository<Adolescente>;
      const mockUzdiRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: true }),
      } as unknown as Repository<Uzdi>;
      const mockInfcRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: true }),
      } as unknown as Repository<Infraccion>;
      const mockExpRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 5, numero_causa: 'EXP-2026-0001', estado: true }),
      } as unknown as Repository<Expediente>;

      const service = new ExpedienteService(
        mockExpRepo,
        mockInfcRepo,
        mockAdlcRepo,
        mockUzdiRepo,
      );

      await expect(
        service.create({
          adlc_id: 1,
          uzdi_id: 1,
          infc_id: 1,
          numero_causa: 'EXP-2026-0001',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    // Comprobamos que el borrado de expediente sea puramente logico (estado = false)
    it('realiza el borrado lógico del expediente actualizando estado a falso', async () => {
      const mockExpRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: true }),
        update: jest.fn().mockResolvedValue({ affected: 1 }),
      } as unknown as Repository<Expediente>;

      const service = new ExpedienteService(
        mockExpRepo,
        {} as Repository<Infraccion>,
        {} as Repository<Adolescente>,
        {} as Repository<Uzdi>,
      );

      const resultado = await service.remove(1);
      expect(resultado).toEqual({ id: 1, estado: false });
      expect(mockExpRepo.update).toHaveBeenCalledWith(1, { estado: false });
    });

    // Validamos que findAll limpie filtros vacios y no envie NaN/undefined a la base (soluciona error 500)
    it('evita error 500 al filtrar expedientes con parámetros vacíos o undefined', async () => {
      const mockExpRepo = {
        find: jest.fn().mockResolvedValue([]),
      } as unknown as Repository<Expediente>;

      const service = new ExpedienteService(
        mockExpRepo,
        {} as Repository<Infraccion>,
        {} as Repository<Adolescente>,
        {} as Repository<Uzdi>,
      );

      await service.findAll({ adlc_id: undefined, infc_id: undefined, uzdi_id: undefined } as any);
      expect(mockExpRepo.find).toHaveBeenCalledWith({
        where: { estado: true },
        order: { id: 'DESC' },
      });
    });
  });

  // --------------------------------------------------------------------------
  // TAREA 2.2: CONTROL SECUENCIAL DE MEDIDAS CONA (MEDIDA_EXPEDIENTE)
  // --------------------------------------------------------------------------
  describe('Tarea 2.2: Medidas CONA (campo orden y control secuencial)', () => {
    // Validamos que el atributo orden sea obligatorio y mayor o igual a 1
    it('exige el campo obligatorio orden mayor o igual a 1 según el CONA', async () => {
      const dtoInvalido = plainToInstance(CreateMedidaExpedienteDto, {
        expe_id: 1,
        mdso_id: 1,
        orden: 0,
        fecha_inicio: '2026-03-01',
      });
      const errores = await validate(dtoInvalido);
      expect(errores.some((e) => e.property === 'orden')).toBe(true);

      const dtoValido = plainToInstance(CreateMedidaExpedienteDto, {
        expe_id: 1,
        mdso_id: 1,
        orden: 1,
        fecha_inicio: '2026-03-01',
      });
      const erroresValido = await validate(dtoValido);
      expect(erroresValido).toHaveLength(0);
    });

    // Validamos que la fecha fin no pueda ser menor a la fecha de inicio
    it('rechaza fecha_fin anterior a fecha_inicio en la medida', async () => {
      const mockExpRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: true }),
      } as unknown as Repository<Expediente>;
      const mockMdsoRepo = {
        findOne: jest.fn().mockResolvedValue({ id: 1, estado: true }),
      } as unknown as Repository<MedidaSocioeducativa>;

      const service = new MedidaExpedienteService(
        {} as Repository<MedidaExpediente>,
        mockExpRepo,
        mockMdsoRepo,
      );

      await expect(
        service.create({
          expe_id: 1,
          mdso_id: 1,
          orden: 1,
          fecha_inicio: '2026-06-01',
          fecha_fin: '2026-05-01',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    // Comprobamos que las medidas se listen ordenadas por su secuencia cronologica CONA
    it('recupera las medidas del expediente ordenadas por el campo orden ASC', async () => {
      const mockRepo = {
        find: jest.fn().mockResolvedValue([
          { id: 10, orden: 1, estado_cumplimiento: 'Cumplida' },
          { id: 11, orden: 2, estado_cumplimiento: 'En proceso' },
        ]),
      } as unknown as Repository<MedidaExpediente>;

      const service = new MedidaExpedienteService(
        mockRepo,
        {} as Repository<Expediente>,
        {} as Repository<MedidaSocioeducativa>,
      );

      const medidas = await service.findAll({ expe_id: 1 });
      expect(medidas).toHaveLength(2);
      expect(medidas[0].orden).toBe(1);
      expect(medidas[1].orden).toBe(2);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { estado: true, expe_id: 1 },
        order: { expe_id: 'ASC', orden: 'ASC', fecha_inicio: 'ASC' },
      });
    });
  });

  // --------------------------------------------------------------------------
  // TAREA 2.3: CATALOGOS PARAMETRICOS DE INFRACCIONES Y MEDIDAS
  // --------------------------------------------------------------------------
  describe('Tarea 2.3: Catálogos de Infracciones y Tipos de Medidas', () => {
    // Validamos que el DTO de infracciones no permita nombres vacios
    it('valida campos obligatorios en el catálogo de infracciones', async () => {
      const dto = plainToInstance(CreateInfraccionDto, {
        nombre: 'Robo simple',
        categoria: 'Contra la propiedad',
      });
      expect(await validate(dto)).toHaveLength(0);

      const dtoInvalido = plainToInstance(CreateInfraccionDto, {
        nombre: '',
        categoria: '',
      });
      expect((await validate(dtoInvalido)).length).toBeGreaterThan(0);
    });

    // Validamos que el DTO de medidas socioeducativas soporte duracion opcional
    it('valida el catálogo de medidas socioeducativas no privativas', async () => {
      const dto = plainToInstance(CreateMedidaSocioeducativaDto, {
        nombre: 'Servicio a la comunidad',
        duracion_meses: 6,
      });
      expect(await validate(dto)).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // TAREA 2.4: MATRIZ DE CONTROL DE ACCESO JUDICIAL (RBAC)
  // --------------------------------------------------------------------------
  describe('Tarea 2.4: Matriz de Control de Acceso Judicial (LEGAL, JUEZ, ADM)', () => {
    // Comprobamos que el controlador de expedientes conceda permisos de escritura a Juridico, Juez y Admin
    it('valida que ExpedienteController otorgue permisos de escritura a Jurídico, Juez y Administrador', () => {
      const createRoles: Rol[] = Reflect.getMetadata(
        ROLES_KEY,
        ExpedienteController.prototype.create,
      );
      expect(createRoles).toBeDefined();
      expect(createRoles).toContain(Rol.JURIDICO);
      expect(createRoles).toContain(Rol.JUEZ);
      expect(createRoles).toContain(Rol.ADMINISTRADOR);
      expect(createRoles).not.toContain(Rol.TRABAJADOR_SOCIAL);
      expect(createRoles).not.toContain(Rol.USUARIO);
    });

    // Comprobamos que la creacion de medidas solo permita perfiles juridicos y administracion
    it('valida que MedidaExpedienteController proteja la asignación de medidas con perfil legal y juez', () => {
      const createRoles: Rol[] = Reflect.getMetadata(
        ROLES_KEY,
        MedidaExpedienteController.prototype.create,
      );
      expect(createRoles).toBeDefined();
      expect(createRoles).toContain(Rol.JURIDICO);
      expect(createRoles).toContain(Rol.JUEZ);
      expect(createRoles).toContain(Rol.ADMINISTRADOR);
      expect(createRoles).not.toContain(Rol.EDUCADOR);
    });

    // Comprobamos que el catalogo de infracciones admita escritura para perfil Juridico y Juez
    it('valida que InfraccionController admita rol Jurídico y Juez para escritura', () => {
      const createRoles: Rol[] = Reflect.getMetadata(
        ROLES_KEY,
        InfraccionController.prototype.create,
      );
      expect(createRoles).toBeDefined();
      expect(createRoles).toContain(Rol.JURIDICO);
      expect(createRoles).toContain(Rol.JUEZ);
      expect(createRoles).toContain(Rol.ADMINISTRADOR);
    });

    // Comprobamos que el catalogo de medidas socioeducativas admita escritura para perfil Juridico y Juez
    it('valida que MedidaSocioeducativaController admita rol Jurídico y Juez para escritura', () => {
      const createRoles: Rol[] = Reflect.getMetadata(
        ROLES_KEY,
        MedidaSocioeducativaController.prototype.create,
      );
      expect(createRoles).toBeDefined();
      expect(createRoles).toContain(Rol.JURIDICO);
      expect(createRoles).toContain(Rol.JUEZ);
      expect(createRoles).toContain(Rol.ADMINISTRADOR);
    });
  });
});

