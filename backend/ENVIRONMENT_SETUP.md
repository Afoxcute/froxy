# Backend Environment Setup

## Quick Fix

Create a `.env` file in the `backend` directory with the following content:

```bash
# Wallet Configuration (required for contract interactions)
WALLET_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# RPC Configuration (Cronos Testnet)
RPC_PROVIDER_URL=https://evm-t3.cronos.org

# Pinata IPFS Configuration (optional)
PINATA_JWT=

# Yakoa API Configuration (optional)
YAKOA_API_KEY=
YAKOA_SUBDOMAIN=
YAKOA_NETWORK=cronos_testnet

# NFT Contract Configuration
NFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Server Configuration
PORT=5000
```

## Network Configuration

- **Network**: Cronos Testnet
- **Chain ID**: 338
- **RPC URL**: https://evm-t3.cronos.org
- **Explorer**: https://explorer.cronos.org/testnet
- **Native Token**: CRO

## To Get Your Real Credentials

### Pinata JWT (for IPFS):
1. Go to [Pinata Developers](https://app.pinata.cloud/developers/api-keys)
2. Create a new API key
3. Copy the JWT token

## Running the Backend

After creating the `.env` file:

```bash
cd backend
yarn install
yarn start
```

The backend should now start successfully on Cronos testnet.
