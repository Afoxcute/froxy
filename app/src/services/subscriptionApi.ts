import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Subscription {
  id: string;
  serviceId: string;
  userAddress: string;
  cost: number | string; // Can be number, string, or Decimal from Prisma
  frequency: 'monthly' | 'weekly' | 'yearly';
  recipientAddress: string;
  lastPaymentDate: string | null;
  nextPaymentDate: string;
  isActive: boolean;
  autoPay: boolean;
  usageData?: {
    lastUsed?: string;
    usageCount?: number;
    avgUsagePerMonth?: number;
  };
  service?: {
    id: string;
    name: string;
    description?: string;
    cost: number | string; // Can be number, string, or Decimal from Prisma
    frequency: string;
    recipientAddress: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  transactionHash: string;
  network: string;
  status: string;
  errorMessage?: string;
  timestamp: string;
}

export interface CreateSubscriptionInput {
  serviceId?: string;
  serviceName?: string;
  cost: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  recipientAddress: string;
  userAddress: string;
  autoPay?: boolean;
  usageData?: {
    lastUsed?: Date;
    usageCount?: number;
    avgUsagePerMonth?: number;
  };
}

export interface UpdateSubscriptionInput {
  serviceId?: string;
  serviceName?: string;
  cost?: number;
  frequency?: 'monthly' | 'weekly' | 'yearly';
  recipientAddress?: string;
  autoPay?: boolean;
  usageData?: {
    lastUsed?: Date;
    usageCount?: number;
    avgUsagePerMonth?: number;
  };
}

export const subscriptionApi = {
  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userAddress: string): Promise<Subscription[]> {
    const response = await api.get(`/subscriptions/user/${userAddress}`);
    return response.data.data;
  },

  /**
   * Get a single subscription by ID
   */
  async getSubscription(id: string): Promise<Subscription> {
    const response = await api.get(`/subscriptions/${id}`);
    return response.data.data;
  },

  /**
   * Create a new subscription
   */
  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    const response = await api.post('/subscriptions', input);
    return response.data.data;
  },

  /**
   * Update a subscription
   */
  async updateSubscription(id: string, input: UpdateSubscriptionInput): Promise<Subscription> {
    const response = await api.put(`/subscriptions/${id}`, input);
    return response.data.data;
  },

  /**
   * Delete (deactivate) a subscription
   */
  async deleteSubscription(id: string): Promise<void> {
    await api.delete(`/subscriptions/${id}`);
  },

  /**
   * Toggle auto-pay for a subscription
   */
  async toggleAutoPay(id: string): Promise<Subscription> {
    const response = await api.patch(`/subscriptions/${id}/auto-pay`);
    return response.data.data;
  },

  /**
   * Record a payment
   */
  async recordPayment(
    subscriptionId: string,
    amount: number,
    transactionHash: string,
    network: string = 'cronos-testnet',
    status: string = 'completed',
    errorMessage?: string
  ): Promise<any> {
    const response = await api.post(`/subscriptions/${subscriptionId}/payments`, {
      amount,
      transactionHash,
      network,
      status,
      errorMessage,
    });
    return response.data.data;
  },

  /**
   * Get payment history for a subscription
   */
  async getPaymentHistory(subscriptionId: string, limit: number = 50): Promise<Payment[]> {
    const response = await api.get(`/subscriptions/${subscriptionId}/payments`, {
      params: { limit },
    });
    return response.data.data;
  },
};

