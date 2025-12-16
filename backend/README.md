# Cronos Testnet IP Management Backend

This backend service provides IP (Intellectual Property) management functionality on the Cronos testnet using the SeekerIP smart contract.

## Features

- **IP Registration**: Register IP assets on Cronos testnet using SeekerIP contract
- **License Minting**: Mint licenses for IP assets with customizable terms
- **IPFS Integration**: Upload metadata to IPFS for decentralized storage
- **Yakoa Integration**: Submit registered IPs to Yakoa for monitoring

## Environment Variables

Create a `.env` file in the backend directory:

```env
WALLET_PRIVATE_KEY=your_private_key_here
RPC_PROVIDER_URL=https://evm-t3.cronos.org
NFT_CONTRACT_ADDRESS=optional_nft_contract_address
```

## API Endpoints

### IP Registration
- **POST** `/api/register`
- **Body**:
  ```json
  {
    "ipMetadata": {
      "name": "IP Asset Name",
      "description": "IP Asset Description",
      "image": "https://ipfs.io/ipfs/...",
      "creator": "0x...",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "nftMetadata": {
      "name": "NFT Name",
      "description": "NFT Description",
      "image": "https://ipfs.io/ipfs/..."
    },
    "SeekerIPContractAddress": "0x0734d90FA1857C073c4bf1e57f4F4151BE2e9f82"
  }
  ```

### License Minting
- **POST** `/api/license/mint`
- **Body**:
  ```json
  {
    "ipAssetId": 1,
    "licensee": "0x...",
    "licenseTerms": {
      "royaltyPercentage": 10,
      "duration": 365,
      "commercialUse": true,
      "terms": "Commercial license terms..."
    },
    "SeekerIPContractAddress": "0x0734d90FA1857C073c4bf1e57f4F4151BE2e9f82"
  }
  ```

## Network Configuration

- **Network**: Cronos Testnet
- **Chain ID**: 338
- **RPC URL**: https://evm-t3.cronos.org
- **Explorer**: https://explorer.cronos.org/testnet
- **Native Token**: CRO

## Smart Contracts

- **SeekerIP**: Main contract for IP registration and license management
- **ERC6551Registry**: Token-bound account registry
- **ERC6551Account**: Token-bound account implementation

## Installation

```bash
cd backend
yarn install
```

## Running the Server

```bash
yarn start
```

The server will start on port 5000 by default.

## Key Changes

1. **Network**: Migrated to Cronos testnet
2. **Token**: Using native CRO token
3. **Contracts**: Using SeekerIP contract for IP management
4. **API**: Updated endpoints to work with Cronos testnet 