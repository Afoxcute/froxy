# Smart Subscription Manager

A decentralized subscription management platform built on Cronos Testnet. Manage recurring payments, track subscriptions, and automate payments using USDC.e tokens with the x402 payment protocol (EIP-3009).

## 🎯 Features

### **Subscription Management**
- **Create Subscriptions**: Set up recurring subscriptions to services with customizable payment frequencies
- **Auto-Pay**: Enable automatic payments for subscriptions when due
- **Payment Tracking**: Complete transaction history with detailed payment records
- **Service Management**: Create and manage payable services
- **AI-Powered Suggestions**: Get intelligent recommendations for subscription cancellations based on usage

### **Payment Processing**
- **x402 Payment Protocol**: Secure payments using EIP-3009 Transfer with Authorization
- **USDC.e Support**: Pay subscriptions using USDC.e tokens on Cronos Testnet
- **Transaction History**: View detailed transaction history with explorer links
- **Payment Status Tracking**: Monitor payment status (completed, pending, failed)

### **User Experience**
- **Modern UI**: Clean, responsive interface with glassmorphism design
- **Real-time Notifications**: Toast notifications for all actions
- **Wallet Integration**: Support for multiple wallets (MetaMask, Coinbase, Trust Wallet, etc.)
- **Balance Display**: Real-time USDC.e balance display
- **Collapsible Transaction Details**: Expandable transaction history with full details

## 🏗️ System Architecture

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Web3 Integration**: Thirdweb SDK v5
- **State Management**: React Hooks and Context API
- **Styling**: CSS Modules with modern design system
- **Build Tool**: Vite

### **Backend**
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful API for subscription and service management
- **Payment Recording**: Tracks all payment transactions on-chain

### **Blockchain**
- **Network**: Cronos Testnet (Chain ID: 338)
- **Token**: USDC.e (ERC-20 compatible)
- **Payment Protocol**: x402 (EIP-3009 Transfer with Authorization)
- **RPC**: https://evm-t3.cronos.org
- **Explorer**: https://explorer.cronos.org/testnet

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ and yarn
- PostgreSQL database (local or cloud-hosted like Aiven)
- MetaMask or compatible wallet
- USDC.e tokens on Cronos Testnet for testing
- Git

### **Installation**

1. **Clone the repository:**
```bash
git clone <repository-url>
cd flenjo
```

2. **Install dependencies:**
```bash
# Frontend
cd app
yarn install

# Backend
cd ../backend
yarn install
```

3. **Set up environment variables:**

**Frontend (`app/.env`):**
```env
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
VITE_API_URL=http://localhost:5000/api
```

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
PORT=5000
RPC_PROVIDER_URL=https://evm-t3.cronos.org
WALLET_PRIVATE_KEY=your_wallet_private_key
```

4. **Set up the database:**

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

5. **Run the development servers:**

**Backend:**
```bash
cd backend
yarn start
# Or with custom port: yarn start -p 5001
```

**Frontend:**
```bash
cd app
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to access the application.

## 📁 Project Structure

```
flenjo/
├── app/                          # Frontend React application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── SubscriptionManager.tsx
│   │   │   ├── SubscriptionCard.tsx
│   │   │   ├── PaymentHistoryItem.tsx
│   │   │   ├── CreateServiceForm.tsx
│   │   │   ├── AISuggestions.tsx
│   │   │   └── USDCBalance.tsx
│   │   ├── services/            # Frontend services
│   │   │   ├── subscriptionService.ts
│   │   │   ├── subscriptionApi.ts
│   │   │   └── x402PaymentService.ts
│   │   ├── contexts/            # React contexts
│   │   │   └── NotificationContext.tsx
│   │   └── layouts/             # Layout components
│   └── package.json
│
├── backend/                      # Backend API server
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   ├── subscriptions.ts
│   │   │   └── services.ts
│   │   ├── services/            # Business logic
│   │   │   └── subscriptionService.ts
│   │   ├── lib/                 # Utilities
│   │   │   └── prisma.ts
│   │   └── index.ts             # Entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   └── package.json
│
└── README.md
```

## 📊 Database Schema

### **Services**
- Represents payable services that users can subscribe to
- Fields: `id`, `name`, `description`, `cost`, `frequency`, `recipientAddress`, `isActive`

### **Subscriptions**
- User subscriptions to services
- Fields: `id`, `serviceId`, `userAddress`, `cost`, `frequency`, `recipientAddress`, `nextPaymentDate`, `autoPay`, `usageData`

### **Payments**
- Records of payments made for subscriptions
- Fields: `id`, `subscriptionId`, `amount`, `transactionHash`, `network`, `status`, `timestamp`

## 🔌 API Endpoints

### **Subscriptions**
- `GET /api/subscriptions/user/:userAddress` - Get all subscriptions for a user
- `GET /api/subscriptions/:id` - Get a single subscription
- `POST /api/subscriptions` - Create a new subscription
- `PUT /api/subscriptions/:id` - Update a subscription
- `DELETE /api/subscriptions/:id` - Delete (deactivate) a subscription
- `PATCH /api/subscriptions/:id/auto-pay` - Toggle auto-pay for a subscription
- `GET /api/subscriptions/:id/payments` - Get payment history for a subscription
- `POST /api/subscriptions/:id/payments` - Record a payment

### **Services**
- `GET /api/services` - Get all active services
- `POST /api/services` - Create a new service

### **Health Check**
- `GET /health` - Check database connectivity and server status

## 💳 Payment Flow

1. **User connects wallet** with USDC.e balance
2. **Creates subscription** to a service
3. **Enables auto-pay** (optional) for automatic payments
4. **Payment processing**:
   - When payment is due, system generates EIP-712 signature
   - Creates EIP-3009 payment header
   - Submits to x402 payment facilitator
   - Records transaction hash in database
5. **Transaction history** is tracked and displayed

## 🎨 Features in Detail

### **Subscription Management**
- Create subscriptions with monthly, weekly, or yearly frequencies
- Set custom costs per subscription
- Enable/disable auto-pay per subscription
- Track next payment dates
- View usage statistics

### **AI Suggestions**
- Analyzes subscription usage patterns
- Suggests cancellations for unused subscriptions
- Provides cost-saving recommendations

### **Transaction History**
- Collapsible transaction cards
- Full transaction details including:
  - Transaction hash with explorer link
  - Payment amount
  - Status (completed, pending, failed)
  - Network information
  - Date and time
  - Error messages (if any)

## 🔧 Configuration

### **Network Configuration**
The system is configured for Cronos Testnet:
- Chain ID: 338
- RPC URL: https://evm-t3.cronos.org
- Explorer: https://explorer.cronos.org/testnet
- Token: USDC.e (ERC-20)

### **Payment Protocol**
Uses x402 payment facilitator with EIP-3009:
- Transfer with Authorization
- Gasless payments (sponsored transactions)
- Secure signature-based authentication

## 📚 Documentation

- [Database Setup Guide](./DATABASE_SETUP.md)
- [Backend Setup Guide](./BACKEND-SETUP-GUIDE.md)
- [Hedera to Cronos Migration](./HEDERA_TO_CRONOS_MIGRATION.md)

## 🧪 Testing

### **Test Subscription Creation**
1. Connect your wallet
2. Ensure you have USDC.e tokens
3. Create a test service
4. Subscribe to the service
5. Verify subscription appears in the list

### **Test Payment Processing**
1. Create a subscription
2. Enable auto-pay or manually pay
3. Approve the transaction in your wallet
4. Verify payment appears in transaction history
5. Check transaction on Cronos explorer

### **Test Auto-Pay**
1. Create a subscription with auto-pay enabled
2. Wait for payment due date
3. System automatically processes payment
4. Verify payment in transaction history

## 🛠️ Development

### **Backend Development**
```bash
cd backend
yarn start          # Start server on default port (5000)
yarn start -p 5001  # Start server on custom port
yarn build          # Build TypeScript
```

### **Frontend Development**
```bash
cd app
yarn dev            # Start dev server
yarn build          # Build for production
yarn preview        # Preview production build
```

### **Database Management**
```bash
cd backend
npx prisma studio   # Open Prisma Studio (database GUI)
npx prisma migrate dev  # Create new migration
npx prisma generate     # Generate Prisma Client
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Cronos Testnet Explorer**: [Cronos Explorer](https://explorer.cronos.org/testnet)
- **Thirdweb Documentation**: [portal.thirdweb.com](https://portal.thirdweb.com)
- **EIP-3009 Specification**: [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- **x402 Payment Protocol**: [x402 Documentation](https://docs.x402.com)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for decentralized subscription management on Cronos**
