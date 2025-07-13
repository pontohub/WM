#!/bin/bash

# PontoHub Portal Deploy Script
set -e

echo "🚀 Starting PontoHub Portal deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Set environment (default to production)
ENVIRONMENT=${1:-production}

print_status "Deploying in $ENVIRONMENT mode..."

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Remove old images (optional)
if [ "$2" = "--clean" ]; then
    print_warning "Removing old images..."
    docker system prune -f
    docker image prune -f
fi

# Build and start containers
if [ "$ENVIRONMENT" = "development" ]; then
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
else
    print_status "Starting production environment..."
    docker-compose up --build -d
fi

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U pontohub_user -d pontohub_portal; then
    print_status "✅ PostgreSQL is healthy"
else
    print_error "❌ PostgreSQL is not healthy"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    print_status "✅ Redis is healthy"
else
    print_error "❌ Redis is not healthy"
fi

# Check Backend
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_status "✅ Backend API is healthy"
else
    print_error "❌ Backend API is not healthy"
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Frontend is healthy"
else
    print_error "❌ Frontend is not healthy"
fi

# Run database migrations (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Running database migrations..."
    docker-compose exec backend npx prisma migrate deploy
    
    print_status "Seeding database..."
    docker-compose exec backend npx prisma db seed
fi

print_status "🎉 Deployment completed successfully!"
print_status "Frontend: http://localhost:3000"
print_status "Backend API: http://localhost:3001"
print_status "API Documentation: http://localhost:3001/api"

echo ""
print_status "To view logs: docker-compose logs -f"
print_status "To stop services: docker-compose down"
print_status "To restart services: docker-compose restart"

