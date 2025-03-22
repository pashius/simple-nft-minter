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
  if (!userAddress) return console.error("No wallet address");

  try {
    const res = await fetch("/.netlify/functions/mint-nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userAddress }),
    });
    const result = await res.json();
    if (!res.ok) console.error("Mint failed:", result);
    else console.log("Mint succeeded:", result);
  } catch(e) {
    console.error("Network error:", e);
  }
}

// Add event listeners to buttons
connectWalletBtn.addEventListener('click', connectWallet);
claimNftBtn.addEventListener('click', mintNFT);
