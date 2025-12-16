import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

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

export class SubscriptionService {
  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userAddress: string) {
    return prisma.subscription.findMany({
      where: {
        userAddress: userAddress.toLowerCase(),
        isActive: true,
      },
      include: {
        service: true,
        payments: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 10, // Last 10 payments
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single subscription by ID
   */
  async getSubscription(id: string) {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        service: true,
        payments: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });
  }

  /**
   * Create a new subscription
   */
  async createSubscription(input: CreateSubscriptionInput) {
    const { serviceId, serviceName, cost, frequency, recipientAddress, userAddress, autoPay, usageData } = input;

    // Calculate next payment date
    const nextPaymentDate = this.calculateNextPaymentDate(frequency);

    // If serviceId is provided, use it; otherwise create a new service
    let finalServiceId = serviceId;
    if (!finalServiceId && serviceName) {
      const service = await prisma.service.create({
        data: {
          name: serviceName,
          cost: new Decimal(cost),
          frequency,
          recipientAddress,
        },
      });
      finalServiceId = service.id;
    }

    if (!finalServiceId) {
      throw new Error('Either serviceId or serviceName must be provided');
    }

    return prisma.subscription.create({
      data: {
        serviceId: finalServiceId,
        userAddress: userAddress.toLowerCase(),
        cost: new Decimal(cost),
        frequency,
        recipientAddress,
        nextPaymentDate,
        autoPay: autoPay ?? false,
        usageData: usageData ? JSON.parse(JSON.stringify(usageData)) : null,
      },
      include: {
        service: true,
      },
    });
  }

  /**
   * Update a subscription
   */
  async updateSubscription(id: string, input: UpdateSubscriptionInput) {
    const updateData: any = {};

    if (input.cost !== undefined) {
      updateData.cost = new Decimal(input.cost);
    }
    if (input.frequency !== undefined) {
      updateData.frequency = input.frequency;
      // Recalculate next payment date if frequency changed
      updateData.nextPaymentDate = this.calculateNextPaymentDate(input.frequency);
    }
    if (input.recipientAddress !== undefined) {
      updateData.recipientAddress = input.recipientAddress;
    }
    if (input.autoPay !== undefined) {
      updateData.autoPay = input.autoPay;
    }
    if (input.usageData !== undefined) {
      updateData.usageData = JSON.parse(JSON.stringify(input.usageData));
    }

    return prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
      },
    });
  }

  /**
   * Delete (deactivate) a subscription
   */
  async deleteSubscription(id: string) {
    return prisma.subscription.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Toggle auto-pay for a subscription
   */
  async toggleAutoPay(id: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return prisma.subscription.update({
      where: { id },
      data: { autoPay: !subscription.autoPay },
    });
  }

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
  ) {
    // Update subscription's last payment date and next payment date
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const nextPaymentDate = this.calculateNextPaymentDate(subscription.frequency);

    // Use a transaction to ensure both operations succeed
    return prisma.$transaction([
      prisma.payment.create({
        data: {
          subscriptionId,
          amount: new Decimal(amount),
          transactionHash,
          network,
          status,
          errorMessage,
        },
      }),
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          lastPaymentDate: new Date(),
          nextPaymentDate,
        },
      }),
    ]);
  }

  /**
   * Get payment history for a subscription
   */
  async getPaymentHistory(subscriptionId: string, limit: number = 50) {
    const payments = await prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    
    // Convert Decimal amounts to numbers for JSON serialization
    return payments.map(payment => ({
      ...payment,
      amount: typeof payment.amount === 'object' && 'toNumber' in payment.amount
        ? (payment.amount as any).toNumber()
        : typeof payment.amount === 'string'
        ? parseFloat(payment.amount)
        : payment.amount,
    }));
  }

  /**
   * Get all services
   */
  async getAllServices() {
    return prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new service
   */
  async createService(data: {
    name: string;
    description?: string;
    cost: number;
    frequency: string;
    recipientAddress: string;
  }) {
    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        cost: new Decimal(data.cost),
        frequency: data.frequency,
        recipientAddress: data.recipientAddress,
      },
    });
  }

  /**
   * Calculate next payment date based on frequency
   */
  private calculateNextPaymentDate(frequency: string): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (frequency) {
      case 'weekly':
        nextDate.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(now.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(now.getMonth() + 1); // Default to monthly
    }

    return nextDate;
  }
}




