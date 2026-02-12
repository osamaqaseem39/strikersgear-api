# Redis Setup Guide

This project uses Redis for caching to improve performance and reduce database load.

## Installation

### Local Development (Windows)

1. **Download Redis for Windows:**
   - Option 1: Use WSL2 (Windows Subsystem for Linux) and install Redis there
   - Option 2: Use Docker: `docker run -d -p 6379:6379 redis:latest`
   - Option 3: Download from [Memurai](https://www.memurai.com/) (Redis-compatible for Windows)

2. **Using Docker (Recommended):**
   ```bash
   docker run -d --name redis -p 6379:6379 redis:latest
   ```

### Local Development (Mac/Linux)

```bash
# Install Redis
brew install redis  # macOS
# or
sudo apt-get install redis-server  # Ubuntu/Debian

# Start Redis
redis-server
```

### Production

Use a managed Redis service:
- **Redis Cloud** (https://redis.com/cloud/)
- **AWS ElastiCache**
- **Azure Cache for Redis**
- **Google Cloud Memorystore**

## Configuration

Add the following environment variables to your `.env` file:

```env
# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Leave empty for local development
REDIS_TTL=300            # Cache TTL in seconds (default: 5 minutes)
REDIS_MAX=100            # Maximum number of items in cache
```

## What Gets Cached

The following endpoints are cached:

1. **Products:**
   - `GET /products` - All products (5 min TTL)
   - `GET /products/:id` - Single product (5 min TTL)
   - `GET /products?categoryId=xxx` - Products by category (5 min TTL)

2. **Banners:**
   - `GET /banners` - All banners (10 min TTL)
   - `GET /banners/:id` - Single banner (10 min TTL)

3. **Categories:**
   - `GET /categories` - All categories (10 min TTL)
   - `GET /categories/:id` - Single category (10 min TTL)

## Cache Invalidation

Cache is automatically invalidated when:
- Products are created, updated, or deleted
- Banners are created, updated, or deleted
- Categories are created, updated, or deleted

## Testing Redis Connection

You can test if Redis is working by:

1. **Using Redis CLI:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Check if cache is working:**
   - Make a request to `/products` endpoint
   - Make the same request again - it should be faster (served from cache)
   - Check Redis: `redis-cli KEYS "*"` to see cached keys

## Troubleshooting

### Redis Connection Error

If you see connection errors:
1. Ensure Redis is running: `redis-cli ping`
2. Check REDIS_HOST and REDIS_PORT in your `.env`
3. For Docker: Ensure container is running: `docker ps`

### Cache Not Working

1. Check Redis logs
2. Verify environment variables are loaded
3. Check if cache keys are being set: `redis-cli KEYS "*"`

## Performance Benefits

- **Reduced Database Load:** Frequently accessed data is served from Redis (in-memory)
- **Faster Response Times:** Redis responses are typically < 1ms vs MongoDB queries (10-50ms)
- **Better Scalability:** Can handle more concurrent requests

## Monitoring

Monitor Redis performance:
- Memory usage: `redis-cli INFO memory`
- Connected clients: `redis-cli INFO clients`
- Cache hit rate: Monitor via application logs
