#!/bin/bash

# PontoHub Portal Backup Script
set -e

echo "💾 Starting PontoHub Portal backup..."

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

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="$BACKUP_DIR/database_backup_$DATE.sql"
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
print_status "Creating database backup..."
docker-compose exec -T postgres pg_dump -U pontohub_user -d pontohub_portal > $DB_BACKUP_FILE

if [ $? -eq 0 ]; then
    print_status "✅ Database backup created: $DB_BACKUP_FILE"
else
    print_error "❌ Database backup failed"
    exit 1
fi

# Uploads backup
print_status "Creating uploads backup..."
docker run --rm -v pontohub-portal_backend_uploads:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/uploads_backup_$DATE.tar.gz -C /data .

if [ $? -eq 0 ]; then
    print_status "✅ Uploads backup created: $UPLOADS_BACKUP_FILE"
else
    print_warning "⚠️ Uploads backup failed or no uploads found"
fi

# Compress database backup
print_status "Compressing database backup..."
gzip $DB_BACKUP_FILE

# Clean old backups (keep last 7 days)
print_status "Cleaning old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Show backup size
BACKUP_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
print_status "Total backup size: $BACKUP_SIZE"

print_status "🎉 Backup completed successfully!"
print_status "Backups stored in: $BACKUP_DIR"

# Optional: Upload to cloud storage
# Uncomment and configure for your cloud provider
# print_status "Uploading to cloud storage..."
# aws s3 cp $DB_BACKUP_FILE.gz s3://your-backup-bucket/pontohub/
# aws s3 cp $UPLOADS_BACKUP_FILE s3://your-backup-bucket/pontohub/

