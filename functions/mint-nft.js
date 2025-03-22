const fetch = require('node-fetch');

exports.handler = async (event) => {
    console.log("Function invoked with event:", event);

    if (event.httpMethod !== 'POST') {
        console.log("Method not allowed:", event.httpMethod);
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { recipient, metadata, chainId, contractAddress } = JSON.parse(event.body);
        console.log("Parsed body:", { recipient, metadata, chainId, contractAddress });

        if (!recipient || !metadata || !chainId || !contractAddress) {
            console.log("Missing required fields");
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: recipient, metadata, chainId, and contractAddress are required' }) };
        }

        const boltApiKey = "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
        const baseUrl = "https://bolt-dev-v2.lightlink.io";

        console.log("Minting NFT with contract address:", contractAddress);
        const response = await fetch(`${baseUrl}/tokens/mint/erc721/${contractAddress}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": boltApiKey
            },
            body: JSON.stringify({
                recipient: recipient,
                metadata: metadata,
                chainId: chainId
            })
        });

        console.log("Bolt API response status:", response.status);
        const result = await response.json();
        console.log("Bolt API response body:", result);

        return {
            statusCode: response.ok ? 200 : response.status,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error("Function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};