This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

This project uses Jest for testing. To run the tests:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run only utility tests
npm run test:utils

# Run tests for CI with coverage
npm run test:ci
```

## Docker Support

The application can be run in Docker containers:

```bash
# Build the Docker image
npm run docker:build

# Run the application in a Docker container
npm run docker:run

# Start the application with Docker Compose
npm run docker:compose

# Stop Docker Compose services
npm run docker:compose:down
```

## CI/CD Pipeline

This project includes GitHub Actions workflows for CI/CD:

- **CI Pipeline**: Runs on every push to main/develop branches and on pull requests. It:
  - Checks out the code
  - Sets up Node.js
  - Installs dependencies
  - Lints the code
  - Runs tests
  - Builds the application
  - Builds a Docker image (on push to main/develop)

- **CD Pipeline**: Runs after a successful CI pipeline on the main branch:
  - Deploys to the production server
  - Verifies the deployment
  - Sends a notification

To set up the CI/CD pipeline, the following secrets are required in your GitHub repository:

- `SSH_PRIVATE_KEY` - For SSH access to the production server
- `PRODUCTION_SERVER_IP` - IP address of the production server
- `PRODUCTION_SERVER_USER` - User for SSH access
- `PRODUCTION_DOMAIN` - Domain for the production site
- `SLACK_WEBHOOK` - For deployment notifications (optional)
- `CODECOV_TOKEN` - For code coverage reporting (optional)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## VM Access and Deployment

To connect to the Azure VM where the application is deployed:

```bash
ssh -i manetho_key.pem -o StrictHostKeyChecking=accept-new azureuser@20.2.217.40
```

### Setting up sudo access without password

If you need to enable passwordless sudo access for the azureuser account:

```bash
# Check current sudo privileges
sudo -l

# Create a sudoers file for the user
echo "azureuser ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/azureuser
sudo chmod 440 /etc/sudoers.d/azureuser
```

### Azure VM Deployment with GitHub Actions

The project is set up to automatically deploy to the Azure VM at 20.2.217.40 using GitHub Actions. The deployment process works as follows:

1. When code is pushed to the `main` branch, the CI pipeline runs tests and builds a Docker image
2. The Docker image is pushed to GitHub Container Registry (ghcr.io)
3. The CD pipeline then connects to the Azure VM and deploys the application using Docker Compose

#### Required GitHub Secrets

To set up the CI/CD pipeline for Azure VM deployment, add the following secrets to your GitHub repository:

- `AZURE_VM_SSH_PRIVATE_KEY` - The SSH private key for authentication (content of manetho_key.pem)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `DATABASE_URL` - PostgreSQL database URL
- `CLERK_WEBHOOK_KEY` - Clerk webhook key
- `OPENROUTER_API_KEY` - OpenRouter API key
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Appwrite endpoint
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Appwrite project ID
- `APPWRITE_API_KEY` - Appwrite API key
- `NEXT_PUBLIC_APPWRITE_BUCKET_ID` - Appwrite bucket ID
- `NEXT_PUBLIC_AGORA_APP_ID` - Agora app ID
- `AGORA_APP_CERTIFICATE` - Agora app certificate
- `SLACK_WEBHOOK` - (Optional) Slack webhook for deployment notifications

#### Manual Deployment

To manually trigger a deployment:

1. Go to your GitHub repository
2. Navigate to Actions → CD Pipeline - Deploy to Azure VM
3. Click "Run workflow" and select the branch to deploy

### Current application status

The following components are currently working:
- AI Doubt Solver
- Community Post Section

### Managing the application on the VM

```bash
# Navigate to application directory
cd ~/manetho-deploy

# View running containers
docker compose -f docker-compose.deploy.yml ps

# View application logs
docker compose -f docker-compose.deploy.yml logs -f

# Restart the application
docker compose -f docker-compose.deploy.yml restart

# Stop the application
docker compose -f docker-compose.deploy.yml down

# Start the application
docker compose -f docker-compose.deploy.yml up -d
```