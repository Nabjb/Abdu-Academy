# Stripe Payment Integration Setup

## Overview
This document explains how to set up and configure Stripe payments for the ABDU Academy platform.

## Prerequisites
- Stripe account (sign up at https://stripe.com)
- Stripe API keys (available in Stripe Dashboard)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key (for frontend)
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret (from Stripe Dashboard)
```

## Stripe Dashboard Setup

### 1. Get API Keys
1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Add them to your `.env.local` file

### 2. Set Up Webhook Endpoint

For local development:
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/payments/webhook`
4. Copy the webhook signing secret and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

For production:
1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add it to your production environment variables

## Payment Flow

1. **User clicks "Buy Course"** on course detail page
2. **Frontend calls** `/api/payments/create-checkout`
3. **Backend creates** Stripe Checkout Session with course metadata
4. **User redirected** to Stripe Checkout
5. **User completes payment** on Stripe
6. **Stripe redirects** to `/checkout/success` or `/checkout/cancel`
7. **Webhook receives** `checkout.session.completed` event
8. **Webhook creates** purchase record in Appwrite database
9. **User gains access** to course content

## Testing

### Test Cards
Use these test card numbers in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Testing Webhooks Locally

1. Start your Next.js server: `npm run dev`
2. In another terminal, run: `stripe listen --forward-to localhost:3000/api/payments/webhook`
3. Make a test purchase
4. Check the Stripe CLI output for webhook events

## Security Notes

- **Never commit** Stripe keys to version control
- **Always verify** webhook signatures using `STRIPE_WEBHOOK_SECRET`
- **Use HTTPS** in production for webhook endpoints
- **Implement idempotency** to prevent duplicate purchases
- **Validate** all webhook events before processing

## Troubleshooting

### Webhook Not Receiving Events
- Check webhook endpoint URL is correct
- Verify webhook secret is set correctly
- Check Stripe Dashboard → Webhooks for delivery logs
- Ensure webhook endpoint is accessible (not behind firewall)

### Purchase Records Not Created
- Check webhook logs in Stripe Dashboard
- Verify webhook signature verification is working
- Check Appwrite database connection
- Review server logs for errors

### Payment Succeeds But No Access
- Verify webhook is processing `checkout.session.completed` event
- Check purchase record was created in database
- Verify user ID matches between session and purchase record
- Check course access logic in content routes

## API Endpoints

### POST `/api/payments/create-checkout`
Creates a Stripe Checkout Session for course purchase.

**Request Body:**
```json
{
  "courseId": "course_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

### POST `/api/payments/webhook`
Stripe webhook endpoint for payment events (called by Stripe, not directly).

### GET `/api/payments/verify-session`
Verifies a purchase session and returns purchase details.

**Query Parameters:**
- `session_id`: Stripe Checkout Session ID

**Response:**
```json
{
  "success": true,
  "purchase": {
    "purchaseId": "...",
    "courseId": "...",
    "amount": 99.99,
    "status": "completed"
  }
}
```

## Next Steps

After setting up Stripe:
1. Test the complete purchase flow
2. Set up production webhook endpoint
3. Configure email receipts in Stripe Dashboard
4. Set up refund handling if needed
5. Monitor webhook delivery in Stripe Dashboard
