// Function to claim the NFT using the contract address
async function claimNFT() {
    if (!provider || !userAddress) {
        alert("Please connect your wallet first!");
        return;
    }

    const contractAddress = contractAddressInput.value.trim();
    if (!contractAddress) {
        alert("Please fetch or enter a contract address!");
        return;
    }

    try {
        claimNftBtn.disabled = true;
        claimNftBtn.textContent = "Claiming...";

        const nftData = {
            metadata: {
                name: "Lightlink Test NFT #1",
                description: "A unique test NFT created on the Lightlink Pegasus Testnet to demonstrate NFT minting functionality.",
                image: "https://ipfs.io/ipfs/QmTestImageHash1234567890abcdef",
                attributes: [
                    { trait_type: "Rarity", value: "Common" },
                    { trait_type: "Category", value: "Test Collectible" },
                    { trait_type: "Created On", value: "March 22, 2025" }
                ]
            },
            amount: 1,
            user_id: userAddress
        };

        const mintEndpoint = "/.netlify/functions/mint-nft";

        const response = await fetch(mintEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                recipient: userAddress,
                metadata: nftData.metadata, // Send only the metadata object as per previous setup
                chainId: 1891,
                contractAddress: contractAddress,
                amount: nftData.amount, // Include amount
                user_id: nftData.user_id // Include user_id
            })
        });

        console.log("Mint response status:", response.status);
        console.log("Mint response headers:", [...response.headers.entries()]);

        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            const rawText = await response.text();
            console.error("Failed to parse JSON. Raw response:", rawText);
            throw new Error(`Failed to parse response: ${jsonError.message}`);
        }

        if (response.ok) {
            alert(`NFT claimed! Tx Hash: ${result.txHash}`);
            console.log("Minting success:", result);
        } else {
            throw new Error(result.error || "Minting failed");
        }
    } catch (error) {
        console.error("NFT claim failed:", error);
        alert(`Failed to claim NFT: ${error.message}`);
    } finally {
        claimNftBtn.disabled = false;
        claimNftBtn.textContent = "Claim NFT";
    }
}
