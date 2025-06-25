# OneDrive Integration Setup Guide

## Step 1: Register Your App in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory > App registrations > New registration**
3. Fill in the details:
   - **Name**: Employee Tracker App
   - **Supported account types**: Personal Microsoft accounts only
   - **Redirect URI**: http://localhost:3000 (for development)
4. Click **Register**

## Step 2: Get Your Credentials

After registration, note down:
- **Application (client) ID** - Copy this value
- **Directory (tenant) ID** - Copy this value

## Step 3: Create a Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and choose expiry
4. **Copy the secret value immediately** (you won't see it again)

## Step 4: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Delegated permissions**
5. Add these permissions:
   - `Files.ReadWrite`
   - `Files.ReadWrite.All`
   - `offline_access`
6. Click **Grant admin consent**

## Step 5: Update Environment Variables

1. Create a `.env` file in the server directory
2. Copy the contents from `env-template.txt`
3. Replace the placeholder values with your actual credentials:
   ```
   MICROSOFT_CLIENT_ID=your-actual-client-id
   MICROSOFT_CLIENT_SECRET=your-actual-client-secret
   MICROSOFT_TENANT_ID=your-actual-tenant-id
   ```

## Step 6: Test the Integration

1. Start your server
2. Take a screenshot through your app
3. Check the server logs for OneDrive upload messages
4. Check your OneDrive folder for uploaded screenshots

## Troubleshooting

- **"Invalid client" error**: Check your client ID and secret
- **"Insufficient privileges" error**: Make sure you granted the correct permissions
- **"Token expired" error**: The service will automatically refresh tokens

## How It Works

1. When a screenshot is taken, it's saved to your database
2. The same screenshot is automatically uploaded to OneDrive
3. A folder is created with the user's email as the name
4. Screenshots are saved with timestamps in the filename

## Microsoft Graph API Token Setup for SharePoint Uploads

To enable automatic screenshot uploads to SharePoint, you must register an Azure AD application and provide its credentials as environment variables.

### Steps:
1. Go to the [Azure Portal](https://portal.azure.com/).
2. Navigate to **Azure Active Directory > App registrations**.
3. Click **New registration** and follow the prompts.
4. After registration, note the **Application (client) ID** and **Directory (tenant) ID**.
5. Go to **Certificates & secrets** and create a new client secret. Copy the value.
6. Under **API permissions**, add the following Microsoft Graph permissions:
   - `Sites.ReadWrite.All`
   - `Files.ReadWrite.All`
   - (Admin consent may be required)
7. Add the following to your `.env` or environment file:
   ```
   AZURE_TENANT_ID=your-tenant-id
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   ```

### Required Environment Variables
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`

These will be used to generate a fresh Microsoft Graph access token for each upload 