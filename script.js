async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        walletStatus.textContent = "Please install MetaMask or ensure it’s enabled!";
        console.log("MetaMask not detected!");
        return;
    }

    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const lightlinkTestnetChainId = '0x763';

        if (chainId !== lightlinkTestnetChainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: lightlinkTestnetChainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: lightlinkTestnetChainId,
                            chainName: 'Lightlink Pegasus Testnet',
                            rpcUrls: ['https://replicator.pegasus.lightlink.io/rpc/v1'],
                            nativeCurrency: { name: 'Lightlink Ether', symbol: 'ETH', decimals: 18 },
                            blockExplorerUrls: ['https://pegasus.lightlink.io']
                        }],
                    });
                } else {
                    throw switchError;
                }
            }
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts returned by MetaMask");
        }

        userAddress = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        walletStatus.textContent = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        connectWalletBtn.style.display = 'none';
        claimNftBtn.disabled = false;

    } catch (error) {
        console.error("Wallet connection failed:", error.message);
        if (error.code === 4001) {
            walletStatus.textContent = "Connection or network switch rejected by user";
        } else if (error.code === -32002) {
            walletStatus.textContent = "Request already pending. Check MetaMask!";
        } else {
            walletStatus.textContent = "Failed to connect wallet: " + error.message;
        }
    }
}

async function mintNFT() {
    const mintStatus = document.getElementById("mint-status");
    if (!userAddress) {
        console.error("No wallet address");
        mintStatus.textContent = "Wallet not connected";
        return;
    }

    mintStatus.textContent = "🛠 Minting your NFT...";

    try {
        const res = await fetch("/.netlify/functions/mint-nft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userAddress }),
        });

        const result = await res.json();

        if (!res.ok || !result.tokenId) {
            throw new Error(result.error || "Minting failed");
        }

        const tokenId = result.tokenId;
        mintStatus.textContent = `✅ NFT Minted! Token ID: ${tokenId}`;

        await new Promise(resolve => setTimeout(resolve, 5000));

        if (typeof window.ethereum !== 'undefined') {
            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC721',
                    options: {
                        address: '0x07B329e57DA2BCCc9a46a1cF20a0C8a9434CcfF2',
                        tokenId: tokenId.toString(),
                        symbol: 'IFT',
                        image: 'https://raw.githubusercontent.com/pashius/simple-nft-minter/refs/heads/master/intern_hand.png'
                    },
                },
            });

            if (wasAdded) {
                mintStatus.textContent = '🎉 NFT added to MetaMask!';
            } else {
                mintStatus.textContent = 'NFT minted! Add it manually in MetaMask if needed.';
            }
        }

    } catch (e) {
        console.error("Error:", e);
        mintStatus.textContent = "Error: " + e.message;
    }
}
