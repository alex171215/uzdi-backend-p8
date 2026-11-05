import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query' && metadata.type !== 'param') {
      return value;
    }
    return this.sanitize(value);
  }

  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      // Remover espacios en blanco al inicio y al final
      let sanitized = obj.trim();
      
      // Capa básica de sanitización: remover scripts (ejemplo básico, se puede extender)
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Opcionalmente escapar tags HTML si no se requiere HTML en los inputs
      sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      return sanitized;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitizedObj: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitizedObj[key] = this.sanitize(value);
      }
      return sanitizedObj;
    }

    return obj;
  }
}
