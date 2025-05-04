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
    if (!API_KEY) throw new Error('BOLT_API_KEY is not set in environment');

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

    const mintData = mintRes.data;
    console.log('Mint response:', mintData);

    const taskId = mintData.id;
    if (!taskId) throw new Error('No task ID returned from mint response');

    // Step 2 → Poll the task status for up to 30 seconds
    let tokenId;
    const pollInterval = 5000; // 5 seconds
    const maxAttempts = 6; // 6 × 5s = 30s
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`Polling attempt ${attempt} for task ${taskId}`);

      const taskRes = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
        headers: { 'x-api-key': API_KEY }
      });

      const taskData = taskRes.data;
      console.log('Task status:', taskData.status);

      if (taskData.status === 'SUCCESS' && taskData.result?.tokenId != null) {
        tokenId = taskData.result.tokenId;
        console.log('✅ tokenId ready:', tokenId);
        break;
      }

      if (taskData.status === 'FAILED') {
        throw new Error('Minting task failed');
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    if (!tokenId) {
      throw new Error('Timed out waiting for tokenId');
    }

    // Step 3 → Transfer NFT to user wallet
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

    const transferData = transferRes.data;
    console.log('Transfer success:', transferData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        mint: mintData,
        transfer: transferData
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
