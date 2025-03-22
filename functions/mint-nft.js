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
        const { recipient, metadata, chainId, contractAddress, amount, user_id } = JSON.parse(event.body);
        console.log("Parsed body:", { recipient, metadata, chainId, contractAddress, amount, user_id });

        if (!recipient || !metadata || !chainId || !contractAddress) {
            console.log("Missing required fields");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields: recipient, metadata, chainId, and contractAddress are required' })
            };
        }

        const boltApiKey = "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
        const baseUrl = "https://bolt-dev-v2.lightlink.io";

        console.log("Minting NFT with contract address:", contractAddress);
        const requestBody = {
            recipient: recipient,
            metadata: metadata,
            chainId: chainId
        };

        // Include amount and user_id if provided
        if (amount !== undefined) {
            requestBody.amount = amount;
        }
        if (user_id !== undefined) {
            requestBody.user_id = user_id;
        }

        const response = await fetch(`${baseUrl}/tokens/mint/erc721/${contractAddress}`, {
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
