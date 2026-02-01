import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createPurchase } from '@/lib/appwrite/helpers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        // Extract metadata
        const courseId = session.metadata?.courseId;
        const userId = session.metadata?.userId;

        if (!courseId || !userId) {
          console.error('Missing metadata in checkout session:', session.id);
          return NextResponse.json(
            { error: 'Missing required metadata' },
            { status: 400 }
          );
        }

        // Check if purchase already exists (idempotency)
        // We'll use the Stripe session ID to check for duplicates
        try {
          // Check if purchase already exists by checking purchases with this session ID
          // This is a simplified check - in production, you'd query the database
          const existingPurchase = await checkExistingPurchase(session.id);
          
          if (existingPurchase) {
            console.log('Purchase already exists for session:', session.id);
            return NextResponse.json({ received: true, message: 'Purchase already processed' });
          }

          // Create purchase record
          await createPurchase({
            userId,
            courseId,
            stripePaymentId: session.payment_intent || session.id,
            stripeSessionId: session.id,
            amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
            currency: session.currency || 'usd',
            status: 'completed',
          });

          console.log('Purchase created successfully:', { courseId, userId, sessionId: session.id });
        } catch (error: any) {
          console.error('Error creating purchase:', error);
          // Don't fail the webhook - Stripe will retry
          return NextResponse.json(
            { error: 'Failed to create purchase record' },
            { status: 500 }
          );
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        // Purchase record should be created via checkout.session.completed
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        console.log('PaymentIntent failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper function to check for existing purchase
async function checkExistingPurchase(sessionId: string): Promise<boolean> {
  try {
    const { databases, DATABASE_ID } = await import('@/lib/appwrite/client');
    const { COLLECTION_IDS } = await import('@/lib/appwrite/collection-ids');
    
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.PURCHASES,
      [`stripeSessionId.equal("${sessionId}")`]
    );

    return result.documents.length > 0;
  } catch (error) {
    console.error('Error checking existing purchase:', error);
    // Return false to allow retry if there's an error checking
    return false;
  }
}
