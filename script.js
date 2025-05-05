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
    console.log("✅ Minted, tokenId:", tokenId);
    mintStatus.textContent = `✅ NFT Minted! Token ID: ${tokenId}`;

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Ask MetaMask to watch the asset
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
      console.log('✅ NFT added to MetaMask!');
      mintStatus.textContent = '🎉 NFT added to MetaMask!';
    } else {
      console.log('⛔ User rejected adding NFT to MetaMask');
      mintStatus.textContent = 'NFT minted! Add it manually in MetaMask if needed.';
    }

  } catch (e) {
    console.error("Error:", e);
    mintStatus.textContent = "Error: " + e.message;
  }
}
