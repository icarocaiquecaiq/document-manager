FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Mudança aqui: usar node:20-slim em vez de node:20-alpine
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

# Instala netcat no Alpine
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/generated ./generated

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# Executa comandos diretamente no CMD usando sh
CMD ["sh", "-c", "echo 'aguardando mysql...' && while ! nc -z mysql 3306; do sleep 1; done && echo 'MySQL conectado!' && echo 'Criando tabelas no banco...' && npx prisma db push --accept-data-loss && echo 'Banco configurado! Iniciando aplicação...' && node dist/main"]