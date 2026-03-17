# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Run the Node.js SSR server
FROM node:22-alpine

WORKDIR /app

# Copy only the built output and production dependencies
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

EXPOSE 4000

CMD ["node", "dist/web/server/server.mjs"]
