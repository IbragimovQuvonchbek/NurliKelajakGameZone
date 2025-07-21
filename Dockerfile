# Use Python 3.10+ (required for Django 5.x)
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Create and set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user and set permissions
ARG USER_ID=1000
ARG GROUP_ID=1000
RUN groupadd -g ${GROUP_ID} appuser && \
    useradd -u ${USER_ID} -g appuser appuser && \
    chown -R appuser:appuser /app

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements and install
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=appuser:appuser . .

# Set correct permissions for SQLite
RUN chmod 664 /app/db.sqlite3 && \
    chown appuser:appuser /app/db.sqlite3

# Collect static files (Django)
RUN python manage.py collectstatic --noinput --clear

# Switch to non-root user
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "config.wsgi:application"]