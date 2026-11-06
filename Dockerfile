# ==========================================
# Etapa 1: Build de la Aplicación
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiar descriptores de paquetes
COPY package*.json ./

# Instalar dependencias completas
RUN npm install

# Copiar código fuente
COPY . .

# Compilar proyecto a JavaScript de producción
RUN npm run build

# ==========================================
# Etapa 2: Imagen Final Ligera para Producción
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Copiar dependencias de producción y artefacto compilado
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# Exponer puerto del servicio
EXPOSE 3000

# Comando de arranque
CMD ["node", "dist/main.js"]

