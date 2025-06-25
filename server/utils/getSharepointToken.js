const axios = require('axios');

let cachedToken = null;
let tokenExpiry = null;

async function getSharepointToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const scope = 'https://graph.microsoft.com/.default';

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', scope);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  const response = await axios.post(url, params);
  cachedToken = response.data.access_token;
  // Set expiry 5 minutes before actual expiry for safety
  tokenExpiry = now + (response.data.expires_in - 300) * 1000;
  return cachedToken;
}

module.exports = { getSharepointToken };