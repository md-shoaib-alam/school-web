# -----------------------------------------------------
# STAGE 1: Dependency Installation & Build
# -----------------------------------------------------
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package specs for caching dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the Next.js standalone application
# Note: Next.js reads NEXT_PUBLIC_ env vars at BUILD time. 
# Make sure to set any build-time environment variables if needed.
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# -----------------------------------------------------
# STAGE 2: Hardened Production Runner (No Source Code)
# -----------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy the standalone build (does not contain original TS/TSX source code)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Next.js standalone builds create a server.js file
CMD ["node", "server.js"]
