# Deployment Notes - Fixing Static Files Issue

## Problem
After deploying the project to the server, CSS styles are not updating - old cached files are being served instead of new ones.

## Solution Steps

### 1. On Your Server

SSH into your server and run these commands:

```bash
# Navigate to your project directory
cd /path/to/NurliKelajakGameZone

# Pull latest changes
git pull origin main

# Run the deployment script
bash deploy_static.sh
```

### 2. Manual Steps (if script doesn't work)

```bash
# Clear old static files
rm -rf staticfiles/

# Collect static files with hash names for cache busting
python manage.py collectstatic --noinput --clear

# Clear Django cache
python manage.py shell -c "from django.core.cache import cache; cache.clear()"

# Restart your web server
sudo systemctl restart gunicorn
# OR if using uWSGI:
sudo systemctl restart uwsgi
# OR if using Apache:
sudo systemctl restart apache2
```

### 3. Client-Side Cache Clear

Users need to clear their browser cache:
- **Chrome/Edge**: Ctrl + Shift + Delete (Windows) or Cmd + Shift + Delete (Mac)
- Or do a hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)

### 4. Verify the Fix

Check that static files have hash names:
```bash
ls -la staticfiles/css/
```

You should see files like:
- `styles.abcd1234.css` (with hash suffix)

## Changes Made

1. **Settings Updated**: Removed invalid middleware reference
2. **Static URL Hashing**: Using Django's `ManifestStaticFilesStorage` for cache busting
3. **Deployment Script**: Created `deploy_static.sh` for easy deployment

## Why This Works

- `ManifestStaticFilesStorage` appends a hash to each static file based on its content
- When you update CSS, the hash changes
- Browsers fetch the new file because the URL is different
- Old cached versions become invalid automatically

## Quick Test

After deployment, open your site in an incognito/private window to test without cache interference.

## If Still Not Working

1. Check nginx/apache configuration for static file serving
2. Verify `STATIC_ROOT` and `STATIC_URL` in settings
3. Check file permissions: `chmod -R 755 staticfiles/`
4. Review server logs for errors
