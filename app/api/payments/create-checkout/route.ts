import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/appwrite/auth';
import { getCourse } from '@/lib/appwrite/helpers';
import { stripe } from '@/lib/stripe/client';
import { z } from 'zod';

const createCheckoutSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const sessionHeader = request.headers.get('cookie');
    const sessionSecret = sessionHeader?.match(/appwrite-session=([^;]+)/)?.[1];
    const user = await getCurrentUser(sessionSecret);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to purchase' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createCheckoutSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { courseId } = validation.data;

    // Get course details
    const course = await getCourse(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseData = course as any;

    // Check if course is free
    if (courseData.price === 0) {
      // For free courses, we'll handle enrollment directly
      // This will be implemented when we have the enrollment logic
      return NextResponse.json(
        { error: 'Free course enrollment not yet implemented' },
        { status: 501 }
      );
    }

    // Check if course is published
    if (courseData.status !== 'published') {
      return NextResponse.json(
        { error: 'Course is not available for purchase' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/courses/${courseData.slug}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: courseData.currency || 'usd',
            product_data: {
              name: courseData.title,
              description: courseData.shortDescription || courseData.description,
              images: courseData.thumbnail ? [courseData.thumbnail] : [],
            },
            unit_amount: Math.round(courseData.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        courseId: courseId,
        userId: user.$id,
      },
      customer_email: user.email,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
