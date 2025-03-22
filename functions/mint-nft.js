const fetch = require('node-fetch');

exports.handler = async (event) => {
    console.log("Function invoked with event:", event);

    if (event.httpMethod !== 'POST') {
        console.log("Method not allowed:", event.httpMethod);
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { metadata } = JSON.parse(event.body);
        console.log("Parsed body:", { metadata });

        if (!metadata) {
            console.log("Missing required fields");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required field: metadata is required' })
            };
        }

        const boltApiKey = "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi"; // Replace with your valid API key
        const contractAddress = "0x62c554f40edc356203ca60584b22831459113aca";
        const userId = "0xf555ceca411e23b57fc678e399822d35e60876b26"; // Use the id from the deployment response
        const baseUrl = "https://bolt-dev-v2.lightlink.io";

        const mintUrl = `${baseUrl}/tokens/mint/erc721/${contractAddress}`;
        console.log("Minting NFT with URL:", mintUrl);

        const requestBody = {
            metadata: {
                name: metadata.name,
                description: metadata.description,
                attributes: metadata.attributes
            },
            amount: 1, // Mint 1 NFT
            user_id: userId
        };

        const response = await fetch(mintUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": boltApiKey
            },
            body: JSON.stringify(requestBody)
        });

        console.log("Bolt API response status:", response.status);
        const result = await response.json();
        console.log("Bolt API response body:", result);

        if (!response.ok) {
            console.log("Bolt API request failed:", result);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: result.message || "Failed to mint NFT" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error) {
        console.error("Function error:", error.message);
        console.error("Error stack:", error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error", details: error.message })
        };
    }
};
