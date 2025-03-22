// mint.js
const axios = require('axios');

const API_KEY       = process.env.BOLT_API_KEY || "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
const BASE_URL      = "https://bolt-dev-v2.lightlink.io";
const CONTRACT_ADDR = userAddress;
const USER_ID       = "0xF555cecA11e23B57FC678E399822D35e60876B26";  // the “key” returned by Bolt when you created/fetched a user

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
  
  axios.post(
    `${BASE_URL}/tokens/mint/erc721/${CONTRACT_ADDR}`,
    payload,
    { headers: { "x-api-key": API_KEY } }
  )
  .then(({ data }) => console.log("✅ Mint successful:", data))
  .catch(err => {
    console.error(`❌ ${err.response?.status || err.message}`, err.response?.data || "");
  });
