const fetch = require('node-fetch');

async function deployContract() {
    try {
        const boltApiKey = "egU3tAdRCQvQ7Qhe9KFA7e7oUI60iYC39naCFyNi";
        const baseUrl = "https://bolt-dev-v2.lightlink.io";

        console.log("Deploying ERC721 contract...");
        const deployResponse = await fetch(`${baseUrl}/contracts/deploy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": boltApiKey
            },
            body: JSON.stringify({
                chainId: 1891, // Lightlink Testnet
                name: "TestNFT",
                symbol: "TNFT"
                // Add more parameters if required by the Bolt API (e.g., royaltyPercentage, gasLimit)
            })
        });

        console.log("Deploy API response status:", deployResponse.status);
        const deployResult = await deployResponse.json();
        console.log("Deploy API response body:", deployResult);

        if (!deployResponse.ok) {
            throw new Error(deployResult.message || "Failed to deploy contract");
        }

        const contractAddress = deployResult.contractAddress;
        if (!contractAddress) {
            throw new Error("Contract address not returned from deploy API");
        }

        console.log("Contract deployed successfully!");
        console.log("Contract Address:", contractAddress);
        return contractAddress;
    } catch (error) {
        console.error("Error deploying contract:", error.message);
        throw error;
    }
}

// Run the function
deployContract().catch((error) => {
    process.exit(1);
});
