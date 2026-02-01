import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when keys aren't set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set. Please add it to your .env.local file.');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export stripe for backward compatibility (will throw if not initialized)
export const stripe = new Proxy({} as Stripe, {
  get() {
    return getStripe();
  },
});

export const STRIPE_CONFIG = {
  currency: 'usd',
  paymentMethods: ['card'],
} as const;
