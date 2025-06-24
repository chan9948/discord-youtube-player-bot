# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Install system dependencies for audio processing and ffmpeg
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Build the TypeScript application
RUN npm run build

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S discordbot -u 1001

# Change ownership of the app directory
RUN chown -R discordbot:nodejs /app
USER discordbot

# Expose port (if needed for health checks)
EXPOSE 3000

# Use a process manager to handle restarts
# Install PM2 globally in the previous layer
USER root
RUN npm install -g pm2
USER discordbot

# Create PM2 ecosystem configuration
COPY --chown=discordbot:nodejs <<EOF /app/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'discord-bot',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s',
    error_file: '/app/logs/err.log',
    out_file: '/app/logs/out.log',
    log_file: '/app/logs/combined.log',
    time: true,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Create logs directory
RUN mkdir -p /app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pm2 show discord-bot | grep -q "online" || exit 1

# Start the application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"] 