const axios = require('axios');
const { botToken } = require('./src/config');

const setWebhook = async () => {
  const webhookUrl = 'https://telegram-links-bot.vercel.app/api/webhook'; // Reemplaza con tu dominio de Vercel
  try {
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      url: webhookUrl
    });
    console.log('Webhook set:', response.data);
  } catch (error) {
    console.error('Error setting webhook:', error.message);
  }
};

setWebhook();