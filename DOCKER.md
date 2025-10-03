# Docker Setup for The Dojo

This project has been containerized using Docker to provide a consistent development and production environment using Node.js from Docker.

## Quick Start

### Development Mode

```bash
# Start development server with hot reloading
pnpm run docker:dev

# Or build and run separately
pnpm run docker:dev:build
pnpm run docker:dev
```

### Production Mode

```bash
# Build and run production version
pnpm run docker:prod:build
pnpm run docker:prod
```

## Docker Architecture

The project uses a multi-stage Dockerfile with three targets:

1. **Builder Stage**: Installs dependencies and builds the application
2. **Production Stage**: Serves the built app using Nginx
3. **Development Stage**: Runs the Vite dev server with hot reloading

## Available Docker Commands

### Docker Compose Commands
- `pnpm run docker:dev` - Start development container
- `pnpm run docker:dev:build` - Build development image
- `pnpm run docker:prod` - Start production container
- `pnpm run docker:prod:build` - Build production image

### Direct Docker Commands
- `pnpm run docker:build` - Build default image
- `pnpm run docker:build:dev` - Build development image
- `pnpm run docker:build:prod` - Build production image
- `pnpm run docker:run:dev` - Run development container
- `pnpm run docker:run:prod` - Run production container
- `pnpm run docker:clean` - Clean up Docker resources

## Environment Configuration

### Development
Copy `.env.example` to `.env.local` and customize:

```bash
cp .env.example .env.local
```

### Production
Use `.env.production.example` as a template for production environment variables.

## Docker Compose Services

### Development Service (`the-dojo-dev`)
- **Port**: 3000
- **Node.js**: Version 22 Alpine
- **Hot Reloading**: Enabled via volume mounts
- **Environment**: Development with debugging enabled

### Production Service (`the-dojo-prod`)
- **Port**: 80
- **Server**: Nginx with optimized configuration
- **Environment**: Production with performance optimizations

## File Structure

```
├── Dockerfile                     # Multi-stage Docker configuration
├── docker-compose.yml            # Main compose configuration
├── docker-compose.override.yml   # Development overrides
├── nginx.conf                    # Nginx configuration for production
├── .dockerignore                 # Files excluded from build context
├── .env.example                  # Development environment template
└── .env.production.example       # Production environment template
```

## Development Workflow

1. **Initial Setup**:
   ```bash
   # Copy environment file
   cp .env.example .env.local
   
   # Start development container
   pnpm run docker:dev
   ```

2. **Code Changes**: 
   - Source code is mounted as volumes for hot reloading
   - Changes in `src/`, `public/`, and config files are reflected immediately

3. **Testing**: 
   ```bash
   # Run tests inside container
   docker-compose exec the-dojo-dev pnpm test
   ```

## Production Deployment

1. **Build Production Image**:
   ```bash
   pnpm run docker:prod:build
   ```

2. **Deploy**:
   ```bash
   # Using Docker Compose
   pnpm run docker:prod
   
   # Or direct Docker run
   docker run -p 80:80 --env-file .env.production the-dojo:prod
   ```

## Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Stop existing containers
docker-compose down
```

**Permission Issues** (Linux/macOS):
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

**Build Failures**:
```bash
# Clean Docker cache
pnpm run docker:clean

# Rebuild without cache
docker-compose build --no-cache the-dojo-dev
```

### Logs and Debugging

```bash
# View container logs
docker-compose logs the-dojo-dev

# Follow logs in real-time
docker-compose logs -f the-dojo-dev

# Execute commands in running container
docker-compose exec the-dojo-dev sh
```

## Performance Considerations

### Development
- Source code volumes are cached for better performance
- Node modules are not mounted (handled by container)
- Hot reloading is optimized for fast feedback

### Production
- Multi-stage build reduces final image size
- Nginx serves static files efficiently
- Gzip compression enabled
- Proper caching headers set
- Security headers included

## Network Configuration

The Docker setup creates a custom network (`the-dojo-network`) for service communication. This is useful when adding additional services like APIs or databases.

## Security

### Development
- Containers run with standard user permissions
- Debug information is available for development

### Production
- Nginx security headers are enabled
- No debug information exposed
- Minimal attack surface with Alpine Linux base