import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
import { redirect } from 'next/navigation';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/utils/db';

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get('session_id') as string;

  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const orderId = session.metadata?.orderId ?? null;
    const cartId = session.metadata?.cartId ?? null;

    if (!orderId || !cartId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const isPaid =
      session.status === 'complete' && session.payment_status === 'paid';

    if (isPaid) {
      await db.order.update({
        where: {
          id: orderId,
        },
        data: {
          isPaid: true,
        },
      });
      await db.cart.delete({
        where: {
          id: cartId,
        },
      });
    }

    // 也可以把狀態帶到頁面：/orders?paid=1 或 /checkout/result?status=...
    return NextResponse.redirect(new URL('/orders', req.url));
  } catch (error) {
    console.log(error);
    return Response.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
  // redirect('/orders');
};
