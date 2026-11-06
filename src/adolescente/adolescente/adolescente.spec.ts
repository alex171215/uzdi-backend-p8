import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateAdolescenteDto } from './dto/create-adolescente.dto';
import { AdolescenteService } from './adolescente.service';
import { Adolescente } from './entities/adolescente.entity';
import { BooleanVF } from '../../common/transformers/boolean-vf.transformer';
import { parsePositiveInt } from '../../common/pipes/positive-int.pipe';

const validBody = {
  cedula: '0123456789',
  nombre: 'María',
  apellido: 'Pérez',
  fecha_nac: '2009-01-01',
  sexo: 'F',
  fecha_ingr: '2026-01-01',
  nacn_id: 1,
  etcv_id: 1,
  etna_id: 1,
  cntn_id: 1,
};

describe('Adolescente', () => {
  it.each(['0123456789', 'AB1234', '123456'])(
    'admite documento %s',
    async (cedula) => {
      const dto = plainToInstance(CreateAdolescenteDto, {
        ...validBody,
        cedula,
      });
      expect(await validate(dto)).toHaveLength(0);
    },
  );

  it.each(['12345', 'AB 1234', 'AB-1234', '123456789012345678901'])(
    'rechaza documento %s',
    async (cedula) => {
      const dto = plainToInstance(CreateAdolescenteDto, {
        ...validBody,
        cedula,
      });
      expect(
        (await validate(dto)).some((error) => error.property === 'cedula'),
      ).toBe(true);
    },
  );

  it('rechaza letras y cadenas en campos numéricos', async () => {
    const dto = plainToInstance(CreateAdolescenteDto, {
      ...validBody,
      nacn_id: '1e2',
    });
    expect(
      (await validate(dto)).some((error) => error.property === 'nacn_id'),
    ).toBe(true);
  });

  it('rechaza null para banderas obligatorias de la base', async () => {
    const dto = plainToInstance(CreateAdolescenteDto, {
      ...validBody,
      reincide: null,
    });
    expect(
      (await validate(dto)).some((error) => error.property === 'reincide'),
    ).toBe(true);
  });

  it('conserva los valores por defecto de la base en campos V/F omitidos', () => {
    expect(BooleanVF.to(undefined)).toBeUndefined();
    expect(BooleanVF.to(false)).toBe('F');
    expect(BooleanVF.to(true)).toBe('V');
  });

  it.each(['0', '-1', '1e2', '2147483648', 'abc'])(
    'rechaza el identificador %s',
    (id) => {
      expect(() => parsePositiveInt(id)).toThrow();
    },
  );

  it('desactiva solo la fila activa y rechaza repetir la operación', async () => {
    const update = jest
      .fn()
      .mockResolvedValueOnce({ affected: 1 })
      .mockResolvedValueOnce({ affected: 0 });
    const service = new AdolescenteService({
      update,
    } as unknown as Repository<Adolescente>);
    await service.remove(7);
    expect(update).toHaveBeenCalledWith(
      { id: 7, estado: true },
      { estado: false },
    );
    await expect(service.remove(7)).rejects.toBeInstanceOf(NotFoundException);
  });
});
