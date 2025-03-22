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
        const { metadata, userAddress } = JSON.parse(event.body);
        console.log("Parsed body:", { metadata, userAddress });

        if (!metadata || !userAddress) {
            console.log("Missing required fields");
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields: metadata and userAddress are required' })
            };
        }

        const boltApiKey = "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
        const projectId = "a2ef391e-994f-4376-9ff3-41398655c246"; // organization_key
        const userId = userAddress; // Use the wallet address as USER_ID
        const baseUrl = "https://bolt-dev-v2.lightlink.io";

        const mintUrl = `${baseUrl}/${projectId}/${userId}/mint`;
        console.log("Minting NFT with URL:", mintUrl);

        const requestBody = {
            name: metadata.name,
            description: metadata.description,
            attributes: metadata.attributes
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
