const fetch = require('node-fetch');

exports.handler = async (event) => {
    console.log("Function invoked with event:", event);

    if (event.httpMethod !== 'POST') {
        console.log("Method not allowed:", event.httpMethod);
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { recipient, metadata, chainId } = JSON.parse(event.body);
        console.log("Parsed body:", { recipient, metadata, chainId });

        if (!recipient || !metadata || !chainId) {
            console.log("Missing required fields");
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
        }

        const boltApiKey = "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
        console.log("Making request to Bolt API...");

        const response = await fetch("https://bolt-dev-v2.lightlink.io/v1/mint", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": boltApiKey
            },
            body: JSON.stringify({
                recipient,
                metadata,
                chainId
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
