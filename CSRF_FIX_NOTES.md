# CSRF Token Fix for Connect the Dots Game

## Issue
The Connect the Dots game saves scores on localhost but not on the server.

## Root Cause
CSRF token handling difference between local and server environments.

## Changes Made

### 1. JavaScript Updates (`static/games/js/connect_dots.js`)
- Added `getCookie()` method to properly read CSRF token from cookies
- Store CSRF token in constructor with fallback to cookie reading
- Simplified `submitScore()` method to use stored token
- Added better error handling and logging

### 2. Settings Updates (`config/settings.py`)
- Set `CSRF_COOKIE_SECURE = False` (for development/testing)
- Set `SESSION_COOKIE_SECURE = False` 
- Added `CSRF_COOKIE_SAMESITE = 'Lax'`
- Added `SESSION_COOKIE_SAMESITE = 'Lax'`

**⚠️ IMPORTANT**: For production server, set these back to `True`:
```python
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
```

### 3. Template Updates (`games/templates/games/connect_dots/connect_dots.html`)
- Kept `{% csrf_token %}` tag in the template

## Server Deployment Steps

1. **Pull latest code**:
   ```bash
   git pull origin main
   ```

2. **Set secure cookies** (edit `config/settings.py`):
   ```python
   CSRF_COOKIE_SECURE = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SAMESITE = 'Lax'
   ```

3. **Run deployment script**:
   ```bash
   bash update.sh
   ```

4. **Clear browser cache**:
   - Users should do Ctrl+Shift+R or Cmd+Shift+R

## Debugging

If scores still don't save on server:

1. **Check browser console** for errors:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for CSRF errors

2. **Check Network tab**:
   - Look for POST request to `save-score/`
   - Check if CSRF token is being sent
   - Check response status code

3. **Check Django logs**:
   ```bash
   docker-compose logs app
   ```

4. **Test CSRF token manually**:
   - Open browser console on game page
   - Run: `document.querySelector('[name=csrfmiddlewaretoken]')?.value`
   - Should return a token string

5. **Verify cookie settings**:
   - Check if cookies are being set
   - Verify `csrftoken` cookie exists
   - Check cookie flags (Secure, SameSite, HttpOnly)

## Expected Behavior

- Game completes
- Score automatically saves to database
- Success message appears in game over screen
- "Reytingni Ko'rish" button appears
- No alert popups

## Common Issues

### Issue: "403 Forbidden" error
**Cause**: CSRF token mismatch  
**Fix**: Clear cookies and reload page

### Issue: Token not found in console
**Cause**: CSRF token not being rendered in template  
**Fix**: Check template has `{% csrf_token %}` tag

### Issue: Works local but not server
**Cause**: Cookie settings mismatch  
**Fix**: Ensure server has `CSRF_COOKIE_SECURE = True` for HTTPS

## Testing

1. Play game until completion
2. Check browser console for "Score saved successfully" message
3. Verify score appears in leaderboard
4. Try multiple scores to ensure consistency
