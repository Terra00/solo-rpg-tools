# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# ---------- Dependencies (cached layer) ----------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Development (Vite dev server with HMR) ----------
FROM node:${NODE_VERSION}-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]

# ---------- Build (production bundle) ----------
FROM deps AS build
COPY . .
RUN npm run build

# ---------- Production (static files served by nginx) ----------
FROM nginx:stable-alpine AS production
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
	CMD wget -qO- http://127.0.0.1/ || exit 1
