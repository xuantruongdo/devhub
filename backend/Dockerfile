# backend/Dockerfile
FROM node:20-alpine

# enable pnpm
RUN corepack enable

WORKDIR /app

# copy lock file trước để cache tốt hơn
COPY package.json pnpm-lock.yaml ./

RUN pnpm install

# copy source
COPY . .

EXPOSE 4040

CMD ["pnpm", "run", "dev"]