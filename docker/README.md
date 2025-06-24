# Discord Bot Docker Setup

This directory contains Docker configuration files to run your Discord YouTube bot in a containerized environment with automatic restart capabilities.

## Files

- `Dockerfile` - Main Docker configuration
- `docker-compose.yml` - Docker Compose configuration for easy deployment
- `.dockerignore` - Files to exclude from Docker build context
- `start.sh` - Convenient startup script

## Features

- **Automatic Restart**: Uses PM2 process manager to restart the bot if it crashes
- **Resource Limits**: Configured memory limits to prevent resource exhaustion
- **Health Checks**: Built-in health monitoring
- **Logging**: Centralized logging with log rotation
- **Security**: Runs as non-root user
- **Optimized Build**: Multi-stage build with production optimizations

## Quick Start

1. **Ensure you have a `.env` file** in the project root with your Discord bot configuration:

   ```bash
   cp .env.example .env
   # Edit .env with your actual Discord bot token and settings
   ```

2. **Run the startup script**:
   ```bash
   cd docker
   ./start.sh
   ```

## Manual Docker Commands

### Using Docker Compose (Recommended)

```bash
# Build and start the bot
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop the bot
docker-compose down

# Restart the bot
docker-compose restart
```

### Using Docker directly

```bash
# Build the image
docker build -t discord-bot -f docker/Dockerfile .

# Run the container
docker run -d \
  --name discord-youtube-bot \
  --restart unless-stopped \
  --env-file .env \
  discord-bot
```

## Monitoring

### View Logs

```bash
# All logs
docker-compose logs -f

# PM2 logs inside container
docker-compose exec discord-bot pm2 logs

# Container stats
docker stats discord-youtube-bot
```

### Bot Status

```bash
# Check if bot is running
docker-compose ps

# PM2 status inside container
docker-compose exec discord-bot pm2 status
```

## Troubleshooting

### Bot Won't Start

1. Check that your `.env` file exists and has the correct Discord token
2. View logs: `docker-compose logs`
3. Ensure you have proper Discord bot permissions

### Out of Memory Issues

The container is limited to 1GB of memory. If you need more:

1. Edit `docker-compose.yml` and increase the memory limits
2. Restart: `docker-compose down && docker-compose up -d`

### Manual Restart

```bash
# Restart just the bot process inside container
docker-compose exec discord-bot pm2 restart discord-bot

# Restart the entire container
docker-compose restart
```

## Environment Variables

Required environment variables in your `.env` file:

- `DISCORD_TOKEN` - Your Discord bot token
- `CLIENT_ID` - Your Discord application client ID
- `GUILD_ID` - Your Discord server ID (optional)

## Auto-Restart Configuration

The bot uses PM2 with the following restart policies:

- **Auto-restart**: Enabled
- **Max restarts**: 10 attempts
- **Restart delay**: 5 seconds between attempts
- **Min uptime**: Must run for at least 10 seconds to be considered stable
- **Memory restart**: Restarts if memory usage exceeds 1GB

## Production Considerations

- The container runs as a non-root user for security
- Logs are persisted to a Docker volume
- Health checks monitor the bot status
- Resource limits prevent runaway processes
- Uses Alpine Linux for minimal image size
