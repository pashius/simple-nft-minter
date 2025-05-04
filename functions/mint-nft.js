const axios = require('axios');

exports.handler = async (event) => {
  try {
    const { userId } = JSON.parse(event.body || '{}');
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId (wallet address)' })
      };
    }

    const API_KEY = process.env.BOLT_API_KEY || "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
    const CONTRACT_ADDR = '0x07B329e57DA2BCCc9a46a1cF20a0C8a9434CcfF2';
    const MINT_WALLET = '0xf555ceca411e23b57fc678e399822d35e60876b26';
    const BASE_URL = 'https://bolt-dev-v2.lightlink.io';

    // Step 1 → Mint NFT
    const mintPayload = {
      metadata: {
        name: 'Intern NFT',
        description: 'Minted via Bolt API',
        image: 'https://raw.githubusercontent.com/pashius/simple-nft-minter/refs/heads/master/intern_hand.png',
        attributes: [{ trait_type: 'Rarity', value: 'Dank' }]
      },
      amount: 1,
      user_id: MINT_WALLET
    };

    const mintRes = await axios.post(
      `${BASE_URL}/tokens/mint/erc721/${CONTRACT_ADDR}`,
      mintPayload,
      { headers: { 'x-api-key': API_KEY } }
    );
    console.log('Mint response:', mintRes.data);

    // ➥ 30-second delay before polling
    console.log('⏳ Waiting 30 seconds before polling balances...');
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Step 2 → Poll balances to detect tokenId
    const pollInterval = 30000;
    const maxAttempts = 4;
    let attempt = 0;
    let tokenId;

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`Polling balances attempt ${attempt}`);

      const balancesRes = await axios.get(
        `${BASE_URL}/tokens/${MINT_WALLET}/balances?page_size=10&page_number=0`,
        { headers: { 'x-api-key': API_KEY } }
      );

      const items = balancesRes.data.items || [];
      console.log(`Balances found: ${items.length}`);

      const nft = items.find(
        (item) => item.contract.toLowerCase() === CONTRACT_ADDR.toLowerCase()
      );

      if (nft) {
        tokenId = nft.token_id;
        console.log('✅ Found tokenId:', tokenId);
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    if (!tokenId) {
      throw new Error('Timed out waiting for tokenId in balances');
    }

    // Step 3 → Transfer to user
    const transferPayload = {
      from: MINT_WALLET,
      to: userId,
      tokenId: tokenId
    };

    const transferRes = await axios.post(
      `${BASE_URL}/tokens/transfer/erc721/${CONTRACT_ADDR}`,
      transferPayload,
      { headers: { 'x-api-key': API_KEY } }
    );

    console.log('Transfer success:', transferRes.data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        mint: mintRes.data,
        transfer: transferRes.data
      })
    };
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    return {
      statusCode: err.response?.status || 500,
      body: JSON.stringify({
        error: err.message,
        details: err.response?.data || null
      })
    };
  }
};
