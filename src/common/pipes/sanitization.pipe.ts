import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (
      metadata.type !== 'body' &&
      metadata.type !== 'query' &&
      metadata.type !== 'param'
    ) {
      return value;
    }
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (
        [...trimmed].some(
          (char) =>
            char.charCodeAt(0) < 32 ||
            char.charCodeAt(0) === 127 ||
            char === '<' ||
            char === '>',
        )
      ) {
        throw new BadRequestException(
          'La entrada contiene caracteres no permitidos',
        );
      }
      return trimmed;
    }
    if (Array.isArray(value)) {
      return value.map((item: unknown) => this.sanitize(item));
    }
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, this.sanitize(item)]),
      );
    }
    return value;
  }
}
