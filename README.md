# Restaurant Dashboard

This is a Next.js project for restaurant management with Docker support, CI/CD pipeline, and Vercel deployment configuration.

## Getting Started

### Local Development

You can run the development server using npm:

```bash
npm run dev
```

Or using Docker:

```bash
# Build and start the Docker container
docker-compose up
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker Setup

This project includes Docker configuration for both development and production environments.

### Development with Docker

The `docker-compose.yml` file is configured for development with hot reloading:

```bash
# Start the development environment
docker-compose up

# Stop the development environment
docker-compose down
```

### Production Build with Docker

To build and run the production version:

```bash
# Build the production Docker image
docker build -t restaurant-dashboard .

# Run the production container
docker run -p 3000:3000 restaurant-dashboard
```

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD. The workflow is defined in `.github/workflows/ci-cd.yml`.

The pipeline:
1. Builds and tests the application on every push to main/master and on pull requests
2. Deploys to Vercel automatically on successful builds from the main/master branch

### Required GitHub Secrets

To enable the CI/CD pipeline, add these secrets to your GitHub repository:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- `VERCEL_ORG_ID`: Your Vercel organization ID

## Deploy on Vercel

The project is configured for deployment on Vercel with the `vercel.json` configuration file.

### Environment variables

Set these in Vercel Project Settings → Environment Variables (Scope: Production and Preview):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

Locally, copy them into a `.env.local` file at the project root.

### Manual Deployment

You can deploy manually using the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel
```

### Automatic Deployment

Pushes to the main/master branch will automatically trigger a deployment through the GitHub Actions workflow.

## Project Structure

- `src/app`: Next.js application code
- `public`: Static assets
- `Dockerfile`: Docker configuration for building the application
- `docker-compose.yml`: Docker Compose configuration for development
- `.github/workflows`: CI/CD configuration
- `vercel.json`: Vercel deployment configuration
