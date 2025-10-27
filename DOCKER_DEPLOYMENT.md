# Docker Deployment Instructions

## Why Old Styles Show on Production

The issue is that Docker volumes persist old static files. When you deploy, the `static_data` volume keeps the old CSS files even though your code changed.

## Solution

### Option 1: Use the Update Script (Recommended)

```bash
bash update.sh
```

This script will:
1. Pull latest code
2. Remove old static files volume
3. Rebuild containers
4. Collect new static files
5. Restart services

### Option 2: Manual Steps

```bash
# 1. Pull latest code
git pull origin main

# 2. Stop containers
docker-compose down

# 3. Remove old static files volume
docker volume rm nurlikelajakgamezone_static_data

# 4. Rebuild and start
docker-compose up -d --build

# 5. Wait a bit for app to start
sleep 5

# 6. Collect static files
docker-compose run --rm app python manage.py collectstatic --noinput

# 7. Restart to pick up new files
docker-compose restart
```

### Option 3: Quick Restart (Without Clearing Volume)

```bash
bash restart.sh
```

⚠️ This keeps old files in the volume. Only use if you just restarted.

## For Users

After deployment, users should:
- **Clear browser cache**: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Or use incognito/private window to test

## Troubleshooting

### Still seeing old styles?

1. **Check if files were collected**:
   ```bash
   docker-compose exec app ls -la staticfiles/css/
   ```

2. **Check volume exists**:
   ```bash
   docker volume ls | grep static
   ```

3. **Force rebuild without cache**:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

4. **Check Nginx is serving new files**:
   ```bash
   docker-compose logs nginx
   ```

## First Time Setup

For first deployment:

```bash
bash setup.sh
```

This sets up SSL certificates and collects initial static files.
