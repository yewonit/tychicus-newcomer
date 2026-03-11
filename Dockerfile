# ── Build stage ──
FROM node:20-alpine AS build

ARG BUILD_MODE=production
ENV NODE_ENV=$BUILD_MODE

RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build -- --mode $BUILD_MODE

# ── Production stage ──
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
