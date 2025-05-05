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

    // 🚀 Call Bolt mint endpoint
    await axios.post(
      `https://bolt-dev-v2.lightlink.io/tokens/mint/erc721/${CONTRACT_ADDR}`,
      {
        metadata: {
          name: 'Intern NFT',
          description: 'Minted via Bolt API',
          image: 'https://raw.githubusercontent.com/pashius/simple-nft-minter/refs/heads/master/intern_hand.png',
          attributes: [{ trait_type: 'Rarity', value: 'Dank' }]
        },
        amount: 1,
        user_id: userId
      },
      { headers: { 'x-api-key': API_KEY } }
    );

    console.log('✅ Mint request sent, waiting 5 sec...');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 🌐 Query Blockscout API for user NFTs
    const blockscoutUrl = `https://pegasus.lightlink.io/api/v2/addresses/${userId}/nft/collections?type=ERC-721`;
    const { data } = await axios.get(blockscoutUrl);

    const contractItem = data.items.find(
      item => item.token.address.toLowerCase() === CONTRACT_ADDR.toLowerCase()
    );

    if (!contractItem || contractItem.token_instances.length === 0) {
      throw new Error('No NFT instances found for this contract.');
    }

    const tokenIds = contractItem.token_instances.map(nft => parseInt(nft.id));
    const latestTokenId = Math.max(...tokenIds);

    console.log('✅ Latest Token ID:', latestTokenId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Minted and fetched tokenId!', tokenId: latestTokenId })
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
