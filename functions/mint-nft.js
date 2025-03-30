// /.netlify/functions/mint-nft.js
const axios = require('axios');

exports.handler = async (event) => {
  try {
    // Parse the incoming POST body
    const { userId } = JSON.parse(event.body || '{}');
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId (wallet address)' })
      };
    }

    // 🔒 Pull your Bolt API key from Netlify’s ENV
    const API_KEY       = process.env.BOLT_API_KEY || "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
    if (!API_KEY) {
      throw new Error('BOLT_API_KEY is not set in environment');
    }

    // 📦 Static ERC‑721 contract address (replace with yours)
    const CONTRACT_ADDR = '0x07B329e57DA2BCCc9a46a1cF20a0C8a9434CcfF2';

    // 📬 Construct the payload with the client’s wallet address
    const payload = {
      metadata: {
        name: 'Intern NFT',
        description: 'Minted via Bolt API',
        image: 'https://raw.githubusercontent.com/pashius/simple-nft-minter/refs/heads/master/intern_hand.png',
        attributes: [{ trait_type: 'Rarity', value: 'Dank' }]
      },
      amount: 1,
      user_id: userId   // ← HERE is where we use the wallet address
    };

    // 🚀 Call Bolt’s mint endpoint
    const { data } = await axios.post(
      https://bolt-dev-v2.lightlink.io/tokens/mint/erc721/${CONTRACT_ADDR},
      payload,
      { headers: { 'x-api-key': API_KEY } }
    );

    return { statusCode: 200, body: JSON.stringify(data) };
  }
  catch (err) {
    console.error('Mint error:', err.response?.data || err.message);
    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({
        error: err.message,
        details: err.response?.data || null
      })
    };
  }
};
