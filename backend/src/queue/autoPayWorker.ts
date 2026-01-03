import { Job } from 'bull';
import { autoPayQueue as getQueue, AutoPayJobData } from './autoPayQueue';
import { SubscriptionService } from '../services/subscriptionService';
import axios from 'axios';

const subscriptionService = new SubscriptionService();

// x402 Payment Facilitator URL
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.cronoslabs.org/v2/x402';
const USDC_TESTNET = process.env.USDC_MINT_TESTNET || '0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0';

interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Process auto-pay jobs from the queue
 */
function initializeWorker() {
  try {
    const queue = getQueue();
    
    queue.process(async (job: Job<AutoPayJobData>) => {
  const { subscriptionId, userAddress, amount, recipientAddress, serviceName } = job.data;

  console.log(`[AUTO_PAY_WORKER] Processing job ${job.id} for subscription: ${subscriptionId}`);

  try {
    // Update progress
    await job.progress(10);

    // Get subscription to verify it still exists and is active
    const subscription = await subscriptionService.getSubscription(subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (!subscription.isActive) {
      throw new Error('Subscription is not active');
    }

    if (!subscription.autoPay) {
      throw new Error('Auto-pay is disabled for this subscription');
    }

    // Check if payment is actually due
    const now = new Date();
    if (subscription.nextPaymentDate > now) {
      throw new Error('Payment is not due yet');
    }

    await job.progress(30);

    // Process payment via x402 protocol
    // Note: In a real implementation, you would need to handle wallet signing
    // For now, we'll create a payment request that needs to be signed by the user's wallet
    // This is a simplified version - in production, you'd need to handle wallet signing server-side
    // or use a different approach like meta-transactions
    
    console.log(`[AUTO_PAY_WORKER] Attempting payment for subscription ${subscriptionId}`);
    console.log(`[AUTO_PAY_WORKER] Amount: ${amount}, Recipient: ${recipientAddress}`);

    // For now, we'll mark this as requiring manual intervention
    // In a full implementation, you would:
    // 1. Generate EIP-712 signature (requires user's private key or wallet interaction)
    // 2. Submit to x402 facilitator
    // 3. Wait for transaction confirmation
    // 4. Record payment in database

    await job.progress(50);

    // Simulate payment processing
    // TODO: Implement actual payment processing with wallet signing
    // This is a placeholder - actual implementation would require:
    // - User's wallet private key (stored securely)
    // - Or meta-transaction service
    // - Or user approval mechanism

    const paymentResult: PaymentResult = {
      success: false,
      error: 'Auto-pay requires wallet signing. Please implement wallet signing mechanism.',
    };

    // If payment was successful, record it
    if (paymentResult.success && paymentResult.transactionHash) {
      await job.progress(80);

      await subscriptionService.recordPayment(
        subscriptionId,
        amount,
        paymentResult.transactionHash,
        'cronos-testnet',
        'completed'
      );

      await job.progress(100);

      console.log(`[AUTO_PAY_WORKER] Payment recorded successfully for subscription ${subscriptionId}`);

      return {
        success: true,
        transactionHash: paymentResult.transactionHash,
        subscriptionId,
        amount,
      };
    } else {
      // Record failed payment
      await subscriptionService.recordPayment(
        subscriptionId,
        amount,
        '', // No transaction hash for failed payments
        'cronos-testnet',
        'failed',
        paymentResult.error
      );

      throw new Error(paymentResult.error || 'Payment processing failed');
    }
  } catch (error) {
    console.error(`[AUTO_PAY_WORKER] Job ${job.id} failed:`, error);

    // Record failed payment attempt
    try {
      await subscriptionService.recordPayment(
        subscriptionId,
        amount,
        '',
        'cronos-testnet',
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } catch (recordError) {
      console.error(`[AUTO_PAY_WORKER] Failed to record payment error:`, recordError);
    }

    throw error;
  }
    });

    console.log('[AUTO_PAY_WORKER] Auto-pay worker started');
  } catch (error: any) {
    console.warn('[AUTO_PAY_WORKER] Queue not available, worker not started:', error.message);
    console.warn('[AUTO_PAY_WORKER] Worker will be initialized when Redis is configured correctly');
  }
}

// Initialize worker when module loads (but only if queue is available)
// This will be called when the module is imported, but will gracefully handle
// Redis connection issues
initializeWorker();



