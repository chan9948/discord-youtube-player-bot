#!/bin/sh

# Script to build and run the Discord bot with Docker

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f "../.env" ]; then
    print_warning ".env file not found. Please create one with your Discord bot token."
    print_warning "Example .env file content:"
    echo "DISCORD_TOKEN=your_discord_bot_token_here"
    echo "CLIENT_ID=your_client_id_here"
    echo "GUILD_ID=your_guild_id_here"
    exit 1
fi

# Build and start the container
print_status "Building and starting Discord bot container..."

# Stop existing container if running
docker compose down 2>/dev/null

# Build and start
if docker compose up --build -d; then
    print_status "Discord bot container started successfully!"
    print_status "Container name: discord-youtube-bot"
    print_status ""
    print_status "Useful commands:"
    echo "  View logs:     docker compose logs -f"
    echo "  Stop bot:      docker compose down"
    echo "  Restart bot:   docker compose restart"
    echo "  Shell access:  docker compose exec discord-bot sh"
    print_status ""
    print_status "The bot will automatically restart if it crashes."
else
    print_error "Failed to start the Discord bot container."
    exit 1
fi
