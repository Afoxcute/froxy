// Utility function to check if an IPFS hash is already registered
export const checkIPFSHashRegistered = async (ipfsHash: string, contractAddress: string) => {
  try {
    const { readContract } = await import('thirdweb');
    const { createThirdwebClient } = await import('thirdweb');
    
    const { CRONOS_TESTNET } = await import('../services/x402PaymentService');
    const cronosTestnet = CRONOS_TESTNET;

    const client = createThirdwebClient({
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id",
    });

    const { getContract } = await import('thirdweb');
    
    const contract = getContract({
      address: contractAddress as `0x${string}`,
      chain: cronosTestnet,
      client: client,
      abi: [
        {
          "inputs": [{"name": "ipfsHash", "type": "string"}],
          "name": "registeredIPFSHashes",
          "outputs": [{"name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
    });

    const isRegistered = await readContract({
      contract: contract,
      method: "registeredIPFSHashes",
      params: [ipfsHash],
    });

    return isRegistered;
  } catch (error) {
    console.error("Error checking IPFS hash registration:", error);
    return false; // Return false on error to allow attempt
  }
};
