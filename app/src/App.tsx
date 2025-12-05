import { useState } from "react";
import "./App.css";
import { useNotificationHelpers } from "./contexts/NotificationContext";
import { NotificationButton } from "./components/NotificationButton";
import { NotificationToasts } from "./components/NotificationCenter";
import MultisigDashboard from "./components/MultisigDashboard";
import MultisigWalletManager from "./components/MultisigWalletManager";
import EscrowManager from "./components/EscrowManager";
import TransactionApproval from "./components/TransactionApproval";

import {
  ThirdwebClient,
} from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { hederaTestnet } from "./services/contractService";
import { createMultisigService, MultisigService } from "./services/multisigService";
import { createEscrowService, EscrowService } from "./services/escrowService";

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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'multisig' | 'escrow' | 'transactions'>('dashboard');
  const [selectedMultisig, setSelectedMultisig] = useState<string>('');

  // Initialize services
  const [multisigService] = useState<MultisigService>(() => 
    createMultisigService(thirdwebClient)
  );
  const [escrowService] = useState<EscrowService>(() => 
    createEscrowService(thirdwebClient)
  );

  return (
    <div className="app">
      {/* Toast Notifications */}
      <NotificationToasts />
      
      {/* Modern Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-logo">
            <h1>Froxy Escrow</h1>
          </div>
          <div className="header-actions">
            <NotificationButton />
            <ConnectButton
              client={thirdwebClient}
              wallets={wallets}
              chain={hederaTestnet}
            />
          </div>
        </div>
      </header>


      <div className="main-content">
        {/* Dashboard Navigation */}
        <div className="dashboard-nav">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'multisig' ? 'active' : ''}`}
            onClick={() => setActiveTab('multisig')}
          >
            👥 Multisig Wallets
          </button>
          <button 
            className={`nav-tab ${activeTab === 'escrow' ? 'active' : ''}`}
            onClick={() => setActiveTab('escrow')}
          >
            🔒 Escrow Services
          </button>
          <button 
            className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
            disabled={!selectedMultisig}
          >
            ✅ Transactions
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <MultisigDashboard
              multisigService={multisigService}
              escrowService={escrowService}
            />
          )}

          {/* Multisig Wallets Tab */}
          {activeTab === 'multisig' && (
            <div className="multisig-section">
              <MultisigWalletManager
                multisigService={multisigService}
                onSuccess={(message) => {
                  notifySuccess('Success', message);
                }}
                onError={(message) => {
                  notifyError('Error', message);
                }}
              />
              
              {multisigService.getAllWallets().length > 0 && (
                <div className="select-multisig-section">
                  <h3>Select Multisig for Transaction Management</h3>
                  <select
                    className="form-select"
                    value={selectedMultisig}
                    onChange={(e) => {
                      setSelectedMultisig(e.target.value);
                      if (e.target.value) {
                        setActiveTab('transactions');
                      }
                    }}
                  >
                    <option value="">Select a multisig wallet...</option>
                    {multisigService.getAllWallets().map((wallet) => (
                      <option key={wallet.address} value={wallet.address}>
                        {wallet.name} ({wallet.threshold} of {wallet.members.length})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Escrow Services Tab */}
          {activeTab === 'escrow' && (
            <EscrowManager
              escrowService={escrowService}
              multisigService={multisigService}
              onSuccess={(message) => {
                notifySuccess('Success', message);
              }}
              onError={(message) => {
                notifyError('Error', message);
              }}
            />
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && selectedMultisig && (
            <TransactionApproval
              multisigService={multisigService}
              multisigAddress={selectedMultisig}
              onSuccess={(message) => {
                notifySuccess('Success', message);
              }}
              onError={(message) => {
                notifyError('Error', message);
              }}
            />
          )}

          {activeTab === 'transactions' && !selectedMultisig && (
            <div className="empty-state card">
              <div className="empty-icon">✅</div>
              <h3>No Multisig Selected</h3>
              <p>Please select a multisig wallet from the Multisig Wallets tab to manage transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
