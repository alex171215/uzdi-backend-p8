import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CantonService } from './canton/canton.service';
import { Canton } from './canton/entities/canton.entity';
import { Provincia } from './provincia/entities/provincia.entity';
import { UzdiService } from './uzdi/uzdi.service';
import { Uzdi } from './uzdi/entities/uzdi.entity';

describe('Filtros geográficos', () => {
  it('filtra cantones activos por provincia activa', async () => {
    const find = jest.fn();
    const service = new CantonService(
      { find } as unknown as Repository<Canton>,
      {} as Repository<Provincia>,
    );
    await service.findAll(3);
    expect(find).toHaveBeenCalledWith({
      where: { estado: true, provincia: { estado: true }, prov_id: 3 },
    });
  });

  it('filtra UZDI por cantón activo y provincia activa', async () => {
    const find = jest.fn();
    const service = new UzdiService(
      { find } as unknown as Repository<Uzdi>,
      {} as Repository<Canton>,
    );
    await service.findAll(4);
    expect(find).toHaveBeenCalledWith({
      where: {
        estado: true,
        canton: { estado: true, provincia: { estado: true } },
        cntn_id: 4,
      },
    });
  });

  it('rechaza crear una UZDI en un cantón inactivo', async () => {
    const save = jest.fn();
    const existsBy = jest.fn().mockResolvedValue(false);
    const service = new UzdiService(
      { save } as unknown as Repository<Uzdi>,
      { existsBy } as unknown as Repository<Canton>,
    );
    await expect(
      service.create({ cntn_id: 4, nombre: 'UZDI Norte', zona: 'Norte' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(save).not.toHaveBeenCalled();
  });
});
