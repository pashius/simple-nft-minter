const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { recipient, metadata, chainId } = JSON.parse(event.body);
    const boltApiKey = "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";

    try {
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

        const result = await response.json();
        return {
            statusCode: response.ok ? 200 : response.status,
            body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
