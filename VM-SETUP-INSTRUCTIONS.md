# VM Setup Instructions

This document provides instructions for setting up the Azure VM for deployment of the Manetho application.

## Initial VM Access

1. Connect to the VM using SSH:
   ```bash
   ssh -i manetho_key.pem -o StrictHostKeyChecking=accept-new azureuser@20.2.217.40
   ```

2. Set up sudo access without password:
   ```bash
   sudo -l
   echo "azureuser ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/azureuser
   sudo chmod 440 /etc/sudoers.d/azureuser
   ```

## Preparing the VM for Docker Deployment

1. Transfer the setup script to the VM:
   ```bash
   scp -i manetho_key.pem vm-setup.sh azureuser@20.2.217.40:~/
   ```

2. Run the setup script on the VM:
   ```bash
   ssh -i manetho_key.pem azureuser@20.2.217.40 "chmod +x ~/vm-setup.sh && sudo ~/vm-setup.sh"
   ```

## SSL Certificate Setup (Optional for Domain)

If you have a domain name pointed to your VM:

1. Transfer the SSL setup script to the VM:
   ```bash
   scp -i manetho_key.pem setup-ssl.sh azureuser@20.2.217.40:~/
   ```

2. Run the SSL setup script on the VM:
   ```bash
   ssh -i manetho_key.pem azureuser@20.2.217.40 "chmod +x ~/setup-ssl.sh && sudo ~/setup-ssl.sh yourdomain.com"
   ```

## Setting up GitHub Actions Secrets

Add the following secrets to your GitHub repository:

1. `AZURE_VM_SSH_PRIVATE_KEY`: The contents of your `manetho_key.pem` file
2. All environment variables from your `.env.local` file:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`
   - `CLERK_WEBHOOK_KEY`
   - `OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_APPWRITE_ENDPOINT`
   - `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
   - `APPWRITE_API_KEY`
   - `NEXT_PUBLIC_APPWRITE_BUCKET_ID`
   - `NEXT_PUBLIC_AGORA_APP_ID`
   - `AGORA_APP_CERTIFICATE`

## Triggering the First Deployment

1. Push to the main branch or manually trigger the workflow:
   - Go to GitHub repository → Actions → CD Pipeline - Deploy to Azure VM
   - Click "Run workflow" and select the main branch

## Monitoring the Deployment

After deployment, you can check the status with:

```bash
ssh -i manetho_key.pem azureuser@20.2.217.40 "cd ~/manetho-deploy && docker compose -f docker-compose.deploy.yml ps"
```

View logs:

```bash
ssh -i manetho_key.pem azureuser@20.2.217.40 "cd ~/manetho-deploy && docker compose -f docker-compose.deploy.yml logs -f"
```
