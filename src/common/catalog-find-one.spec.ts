import { NotFoundException } from '@nestjs/common';
import { NacionalidadService } from '../adolescente/nacionalidad/nacionalidad.service';
import { EstadoCivilService } from '../adolescente/estado-civil/estado-civil.service';
import { EtniaService } from '../adolescente/etnia/etnia.service';
import { GdoService } from '../adolescente/gdo/gdo.service';
import { ProvinciaService } from '../estructura-institucional/provincia/provincia.service';
import { CantonService } from '../estructura-institucional/canton/canton.service';
import { UzdiService } from '../estructura-institucional/uzdi/uzdi.service';

describe('GET por ID de catálogos y geografía', () => {
  const cases = [
    ['nacionalidad', (repo: never) => new NacionalidadService(repo)],
    ['estado civil', (repo: never) => new EstadoCivilService(repo)],
    ['etnia', (repo: never) => new EtniaService(repo)],
    ['GDO', (repo: never) => new GdoService(repo)],
    ['provincia', (repo: never) => new ProvinciaService(repo)],
    ['cantón', (repo: never) => new CantonService(repo, {} as never)],
    ['UZDI', (repo: never) => new UzdiService(repo, {} as never)],
  ] as const;

  it.each(cases)(
    '%s responde 404 si no existe fila activa',
    async (_, make) => {
      const findOne = jest.fn().mockResolvedValue(null);
      const service = make({ findOne } as never);
      await expect(service.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    },
  );
});
