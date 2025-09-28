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

# Instala http-server globalmente
RUN npm install -g http-server

COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/generated ./generated
COPY --from=builder /usr/src/app/dist ./dist

# Copia a pasta test/fixtures/html para o container
COPY test/fixtures/html ./test/fixtures/html

EXPOSE 3000
EXPOSE 8080

# Executa ambos os serviços simultaneamente usando &
CMD ["sh", "-c", "echo ' Aguardando MySQL...' && while ! nc -z mysql 3306; do sleep 1; done && echo ' MySQL conectado!' && echo ' Criando tabelas no banco...' && npx prisma db push --accept-data-loss && echo ' Banco configurado!' && echo ' Iniciando servidor HTTP na porta 8080...' && http-server test/fixtures/html -p 8080 --cors -c-1 & echo ' Iniciando aplicação principal...' && node dist/main"]