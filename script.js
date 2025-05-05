const connectWalletBtn = document.getElementById('connect-wallet');
const claimNftBtn = document.getElementById('claim-nft');
const walletStatus = document.getElementById('wallet-status');

let userAddress = null;
let provider = null;

// Function to connect the wallet and ensure Lightlink Testnet
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        walletStatus.textContent = "Please install MetaMask or ensure it’s enabled!";
        console.log("MetaMask not detected!");
        return;
    }

    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const lightlinkTestnetChainId = '0x763'; // 1891 in hex

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
                            nativeCurrency: {
                                name: 'Lightlink Ether',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            blockExplorerUrls: ['https://pegasus.lightlink.io']
                        }],
                    });
                } else {
                    throw switchError;
                }
            }
        }

        console.log("Requesting accounts...");
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts returned by MetaMask");
        }

        userAddress = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("Connected address:", userAddress);

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

// Function to claim the NFT using the hardcoded contract address
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

        if (!res.ok || result.status != "error") {
            console.log("Claim successful!:", result);
            mintStatus.textContent = "Claim Successful. Adding to wallet in 5 sec...";

            // Wait 5 seconds
            setTimeout(async () => {
                try {
                    const wasAdded = await window.ethereum.request({
                        method: 'wallet_watchAsset',
                        params: {
                            type: 'ERC721',
                            options: {
                                address: '0x07B329e57DA2BCCc9a46a1cF20a0C8a9434CcfF2', // your contract address
                                tokenId: String(result.tokenId || 'LAST_KNOWN_TOKEN_ID'), // replace or track from backend if needed
                                symbol: 'IFT',
                                decimals: 0,
                                image: 'https://raw.githubusercontent.com/pashius/simple-nft-minter/refs/heads/master/intern_hand.png',
                            },
                        },
                    });

                    if (wasAdded) {
                        console.log('NFT added to MetaMask!');
                        mintStatus.textContent = "✅ NFT added to your MetaMask!";
                    } else {
                        console.log('User rejected adding NFT to MetaMask.');
                        mintStatus.textContent = "⚠ NFT minted, but not added to wallet.";
                    }
                } catch (addError) {
                    console.error('Failed to add NFT to MetaMask:', addError);
                    mintStatus.textContent = "⚠ NFT minted, but wallet add failed.";
                }
            }, 5000);
        }
    } catch (e) {
        console.error("Network error:", e);
        mintStatus.textContent = "Network error. Please try later.";
    }
}

// Add event listeners to buttons
connectWalletBtn.addEventListener('click', connectWallet);
claimNftBtn.addEventListener('click', mintNFT);
