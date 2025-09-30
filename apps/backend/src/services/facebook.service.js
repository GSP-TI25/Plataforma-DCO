// Ubicación: DCO/apps/backend/src/services/facebook.service.js
const axios = require('axios');
const db = require('./pg.service');

// Intercambia un token de corta duración por uno de larga duración
const getLongLivedAccessToken = async (shortLivedToken) => {
  const url = 'https://graph.facebook.com/v18.0/oauth/access_token';
  const params = {
    grant_type: 'fb_exchange_token',
    client_id: process.env.FACEBOOK_APP_ID,
    client_secret: process.env.FACEBOOK_APP_SECRET,
    fb_exchange_token: shortLivedToken,
  };
  const response = await axios.get(url, { params });
  return response.data.access_token;
};

// Guarda la credencial en nuestra base de datos
const saveCredential = async (clientId, accessToken) => {
  // Primero, borramos cualquier credencial vieja de Meta para este cliente
  await db.query(
    "DELETE FROM api_credentials WHERE client_id = $1 AND platform = 'meta'",
    [clientId]
  );

  // Luego, insertamos la nueva
  const query = `
    INSERT INTO api_credentials (client_id, platform, access_token)
    VALUES ($1, 'meta', $2)
    RETURNING *;
  `;
  const result = await db.query(query, [clientId, accessToken]);
  return result.rows[0];
};

const getAdAccounts = async (accessToken) => {
  // Este es el endpoint de la Graph API de Meta para obtener las cuentas publicitarias
  const url = `https://graph.facebook.com/v18.0/me/adaccounts`;
  const params = {
    access_token: accessToken,
    // Le pedimos campos específicos que nos serán útiles
    fields: 'id,name,account_status,business_name',
  };
  const response = await axios.get(url, { params });
  return response.data.data; // Las cuentas vienen en el array 'data'
};

const getCampaignsByAdAccount = async (accessToken, adAccountId) => {
  const url = `https://graph.facebook.com/v18.0/${adAccountId}/campaigns`;
  const params = {
    access_token: accessToken,
    // Pedimos los campos más importantes de una campaña
    fields: 'id,name,status,objective,effective_status',
  };
  const response = await axios.get(url, { params });
  return response.data.data;
};

const createCampaignInMeta = async (accessToken, adAccountId, campaignData) => {
  const { name, objective } = campaignData;
  const url = `https://graph.facebook.com/v18.0/${adAccountId}/campaigns`;

  const params = {
    access_token: accessToken,
    name: name,
    objective: objective,
    status: 'PAUSED', 
    special_ad_categories: [],
  };

  // Para crear, usamos una petición POST
  const response = await axios.post(url, params);
  return response.data; 
};

const deleteMetaAdObject = async (accessToken, objectId) => {
  const url = `https://graph.facebook.com/v18.0/${objectId}`;
  const params = { access_token: accessToken };

  // Para eliminar, usamos una petición DELETE
  const response = await axios.delete(url, { params });
  return response.data; 
};

const getAdSetsByCampaign = async (accessToken, campaignId) => {
  const url = `https://graph.facebook.com/v18.0/${campaignId}/adsets`;
  const params = {
    access_token: accessToken,
    fields: 'id,name,status,daily_budget,lifetime_budget,optimization_goal',
  };
  const response = await axios.get(url, { params });
  return response.data.data;
};

const createAdSetInMeta = async (accessToken, adAccountId, adSetData) => {
  const { name, campaign_id, daily_budget } = adSetData;
  const url = `https://graph.facebook.com/v19.0/${adAccountId}/adsets`;

  const params = {
    access_token: accessToken,
    name: name,
    campaign_id: campaign_id,
    daily_budget: daily_budget, 
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LINK_CLICKS', 
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP', 
    targeting: { 
      geo_locations: { countries: ['PE'] },
    },
    status: 'PAUSED', 
  };

  const response = await axios.post(url, params);
  return response.data;
};



const createAdCreativeInMeta = async (accessToken, adAccountId, creativeData) => {
  const { name, page_id, message, image_hash, link } = creativeData;
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/adcreatives`;

  const params = {
    access_token: accessToken,
    name: name,
    object_story_spec: {
      page_id: page_id,
      link_data: {
        message: message,
        link: link,
        image_hash: image_hash,
      },
    },
  };

  try {
    const response = await axios.post(url, params);
    return response.data;
  } catch (error) {
    console.error('Error creating Meta Ad Creative:', error.response?.data);
    throw new Error('Failed to create Meta Ad Creative.');
  }
};

const uploadImageToMeta = async (accessToken, adAccountId, imageUrl) => {
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/adimages`;

  const params = {
    access_token: accessToken,
    url: imageUrl,
  };

  try {
    const response = await axios.post(url, params);
    return response.data.images[Object.keys(response.data.images)[0]];
  } catch (error) {
    console.error('Error uploading image to Meta:', error.response?.data);
    throw new Error('Failed to upload image to Meta.');
  }
};

const createAdInMeta = async (accessToken, adAccountId, adData) => {
  const { name, ad_set_id, creative_id } = adData;
  const url = `https://graph.facebook.com/v19.0/act_${adAccountId}/ads`;

  const params = {
    access_token: accessToken,
    name: name,
    adset_id: ad_set_id,
    creative: { creative_id: creative_id },
    status: 'PAUSED',
  };

  try {
    const response = await axios.post(url, params);
    return response.data;
  } catch (error) {
    console.error('Error creating Meta Ad:', error.response?.data);
    throw new Error('Failed to create Meta Ad.');
  }
};

const uploadImageAndGetHash = async (accessToken, adAccountId, imageUrl) => {
  const url = `https://graph.facebook.com/v19.0/${adAccountId}/adimages`;
  const params = {
    access_token: accessToken,
    url: imageUrl,
  };
  const response = await axios.post(url, params);
  return response.data.images[Object.keys(response.data.images)[0]].hash;
};

const createAdCreative = async (accessToken, adAccountId, creativeData) => {
  const url = `https://graph.facebook.com/v19.0/${adAccountId}/adcreatives`;
  const { name, page_id, message, link, image_hash } = creativeData;
  
  const params = {
    access_token: accessToken,
    name: name,
    object_story_spec: {
      page_id: page_id,
      link_data: {
        message: message,
        link: link,
        image_hash: image_hash,
      },
    },
  };
  const response = await axios.post(url, params);
  return response.data.id;
};

const createAd = async (accessToken, adAccountId, adData) => {
  const url = `https://graph.facebook.com/v19.0/${adAccountId}/ads`;
  const { name, adset_id, creative_id } = adData;

  const params = {
    access_token: accessToken,
    name: name,
    adset_id: adset_id,
    creative: {
      creative_id: creative_id,
    },
    status: 'PAUSED', 
  };
  const response = await axios.post(url, params);
  return response.data;
};

const getFacebookPages = async (accessToken) => {
  const url = `https://graph.facebook.com/v19.0/me/accounts`;
  const params = {
    access_token: accessToken,
    fields: 'id,name,picture',
  };
  const response = await axios.get(url, { params });
  return response.data.data; 
};

module.exports = {
  getLongLivedAccessToken,
  saveCredential,
  getAdAccounts,
  getCampaignsByAdAccount,
  createCampaignInMeta,
  deleteMetaAdObject,
  getAdSetsByCampaign,
  createAdSetInMeta,
  createAdCreativeInMeta,
  uploadImageToMeta,
  createAdInMeta,
  uploadImageAndGetHash,
  createAdCreative,
  createAd,
  getFacebookPages,
};