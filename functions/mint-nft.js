const axios = require('axios');

exports.handler = async (event) => {
  try {
    const { address } = JSON.parse(event.body || '{}');
    if (!address) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing address in request' }) };
    }

    const API_KEY       = process.env.BOLT_API_KEY || "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
    const BASE_URL      = "https://bolt-dev-v2.lightlink.io";
    const CONTRACT_ADDR = "0x62c554f40edc356203ca60584b22831459113aca";
    const USER_ID       = "0xF555cecA11e23B57FC678E399822D35e60876B26";

    const payload = {
      metadata: {
        name: "My NFT",
        description: "Minted via Bolt API",
        image: "https://example.com/image.png",
        attributes: [{ trait_type: "Rarity", value: "Common" }]
      },
      amount: 1,
      user_id: USER_ID
    };

    const response = await axios.post(
      `${BASE_URL}/tokens/mint/erc721/${CONTRACT_ADDR}`,
      payload,
      { headers: { "x-api-key": API_KEY } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  }
  catch (err) {
    console.error("Mint error:", err);
    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({ error: err.message, details: err.response?.data })
    };
  }
};
