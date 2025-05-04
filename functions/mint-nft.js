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
    const BLOCKSCOUT_API = 'https://pegasus.lightlink.io/api';

    // Mint NFT
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
    console.log('✅ Mint response:', mintRes.data);

    // Wait 30 sec
    console.log('⏳ Waiting 30 sec for Blockscout index...');
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Query Blockscout
    const scoutUrl = `${BLOCKSCOUT_API}?module=account&action=tokennfttx&address=${MINT_WALLET}&contractaddress=${CONTRACT_ADDR}&sort=desc`;
    const scoutRes = await axios.get(scoutUrl);
    const scoutData = scoutRes.data.result || [];

    if (!scoutData || scoutData.length === 0) {
      throw new Error('No token transfers found on Blockscout');
    }

    const latestToken = scoutData[0];
    const tokenId = latestToken.tokenID;
    console.log('✅ tokenId from Blockscout:', tokenId);

    // Transfer NFT to user
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

    console.log('✅ Transfer success:', transferRes.data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        mint: mintRes.data,
        tokenId: tokenId,
        transfer: transferRes.data
      })
    };
  } catch (err) {
    console.error('❌ FULL ERROR:', err);
    console.error('❌ RESPONSE DATA:', err.response?.data);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: err.response?.data || null
      })
    };
  }
};
