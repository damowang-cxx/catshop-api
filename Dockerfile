FROM node:22-alpine AS base
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma:generate && pnpm build

EXPOSE 3001
CMD ["pnpm", "start:prod"]
