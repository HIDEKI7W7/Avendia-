# Etapa 1: Instalar dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: Construir el código fuente
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar la telemetría durante la compilación
ENV NEXT_TELEMETRY_DISABLED=1

# Inyectar variables en tiempo de construcción
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Etapa 3: Ejecutar la aplicación en producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Configurar permisos para la caché
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar el compilado standalone optimizado para Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Arrancar el servidor standalone Node.js generado
CMD ["node", "server.js"]
