# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy full source code
COPY . .

# Build NestJS application
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built dist directory from builder stage
COPY --from=builder /app/dist ./dist

# Expose NestJS default port
EXPOSE 3000

# Start production server
CMD ["node", "dist/main.js"]
