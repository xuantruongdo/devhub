FROM node:20-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

# FORCE PORT = 3000 (override mọi env từ .env / docker-compose)
CMD ["sh", "-c", "PORT=3000 pnpm start"]