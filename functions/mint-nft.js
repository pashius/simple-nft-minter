const { Configuration, AccountsApi, TokensApi, AccountType } = require('lightlink-bolt-sdk');

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

        const config = new Configuration({
            basePath: 'https://bolt-v2.lightlink.io',
            apiKey: 'egU3TdRQCvQ7Qhe9KF47o7UI6b1YC39aCFYNI' // Hardcoded API key
        });

        const accountsApi = new AccountsApi(config);
        const tokensApi = new TokensApi(config);

        // Step 1: Create a managed account for the user (if not already created)
        let account;
        try {
            account = await accountsApi.createAccount({
                type: AccountType.MANAGED,
                external_ref: userAddress
            });
            console.log("Account Created:", account);
        } catch (error) {
            if (error.message.includes("already exists")) {
                console.log("Account already exists for user:", userAddress);
                account = { address: userAddress }; // Use wallet address as fallback
            } else {
                throw error;
            }
        }

        // Step 2: Mint the NFT to the user's account using the deployed contract address
        const contractAddress = "0x62554f40edc356203c069584b282314591113aca"; // From the dashboard
        const mintParams = {
            metadata: {
                name: metadata.name,
                description: metadata.description,
                attributes: metadata.attributes
            },
            amount: 1,
            user_id: userAddress // Use the userAddress directly, as in the dashboard request
        };

        const mintResult = await tokensApi.mintERC721Token(contractAddress, mintParams);
        console.log("Minting Result:", mintResult);

        return {
            statusCode: 200,
            body: JSON.stringify(mintResult)
        };
    } catch (error) {
        console.error("Function error:", error.message);
        console.error("Error stack:", error.stack);
        if (error.response) {
            console.error("Response data:", JSON.stringify(error.response.data, null, 2));
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to mint NFT", details: error.message })
        };
    }
};
