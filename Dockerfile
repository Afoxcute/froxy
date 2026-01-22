# Use Node 20 Alpine
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Copy package files
COPY backend/package*.json ./

# Install dependencies (including devDeps for build step)
RUN npm ci --include=dev

# Copy source code
COPY backend/ .

# Build TypeScript to JavaScript
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy only production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy built JS from previous stage
COPY --from=base /usr/src/app/dist ./dist

# Copy .env is NOT needed here — it will be mounted at runtime
# But ensure your app can read from /usr/src/app/.env

EXPOSE 8080

# Run the compiled JS
CMD ["node", "dist/index.js"]
