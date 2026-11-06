import { BadRequestException } from '@nestjs/common';

export function parsePositiveInt(value: string): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new BadRequestException(
      'El identificador debe ser un entero positivo',
    );
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 2147483647) {
    throw new BadRequestException('El identificador está fuera de rango');
  }
  return id;
}
