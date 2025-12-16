import { useState } from "react";
import "./App.css";
import { useNotificationHelpers } from "./contexts/NotificationContext";
import { NotificationButton } from "./components/NotificationButton";
import { NotificationToasts } from "./components/NotificationCenter";
import SubscriptionManager from "./components/SubscriptionManager";
import USDCBalance from "./components/USDCBalance";

import {
  ThirdwebClient,
} from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { CRONOS_TESTNET } from "./services/x402PaymentService";
import { createSubscriptionAgent, SubscriptionAgent } from "./services/subscriptionService";


// custodial wallets for thirdweb
const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email", "passkey", "phone"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
  createWallet("com.trustwallet.app"),
  createWallet("global.safe"),
];

interface AppProps {
  thirdwebClient: ThirdwebClient;
}

export default function App({ thirdwebClient }: AppProps) {
  const { notifySuccess, notifyError } = useNotificationHelpers();

  // Initialize subscription agent
  const [subscriptionAgent] = useState<SubscriptionAgent>(() => 
    createSubscriptionAgent(thirdwebClient)
  );

  return (
    <div className="app">
      {/* Toast Notifications */}
      <NotificationToasts />
      
      {/* Modern Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-logo">
            <h1>🤖 Smart Subscription Manager</h1>
          </div>
          <div className="header-actions">
            <NotificationButton />
            <USDCBalance client={thirdwebClient} />
            <ConnectButton
              client={thirdwebClient}
              wallets={wallets}
              chain={CRONOS_TESTNET}
            />
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="tab-content">
          <SubscriptionManager
            subscriptionAgent={subscriptionAgent}
            onSuccess={(message) => {
              notifySuccess('Success', message);
            }}
            onError={(message) => {
              notifyError('Error', message);
            }}
          />
        </div>
      </div>
    </div>
  );
}
