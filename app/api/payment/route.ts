import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil', // 建議鎖版本
});
import { type NextRequest } from 'next/server';
import db from '@/utils/db';

export const POST = async (req: NextRequest) => {
  const requestHeaders = new Headers(req.headers);
  const origin =
    requestHeaders.get('origin') ?? process.env.NEXT_PUBLIC_BASE_URL;

  const { orderId, cartId } = await req.json();

  // 1) 基本驗證
  if (!orderId || !cartId) {
    return Response.json({ error: 'Missing params' }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
  });

  const cart = await db.cart.findUnique({
    where: {
      id: cartId,
    },
    include: {
      cartItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order || !cart) {
    return Response.json(null, { status: 404, statusText: 'Not Found' });
  }

  // 2) 產生 line_items（鎖金額於伺服器）
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    cart.cartItems.map((cartItem) => ({
      quantity: cartItem.amount,
      price_data: {
        currency: 'usd',
        product_data: {
          name: cartItem.product.name,
          images: [cartItem.product.image],
        },
        unit_amount: cartItem.product.price * 100, // cents
      },
    }));

  try {
    // 3) 建立 Embedded Checkout Session（帶入 line_items）
    const session = await stripe.checkout.sessions.create(
      {
        ui_mode: 'embedded',
        mode: 'payment',
        // 可選：透過 email 綁定客戶（或使用既有 customer id）
        customer_email: order.email ?? undefined,
        line_items, // <== 關鍵：把你算好的項目帶進去
        metadata: { orderId, cartId },
        // return 到前端頁（不是 API），前端可據此顯示結果
        return_url: `${origin}/api/confirm?session_id={CHECKOUT_SESSION_ID}`,
      },
      {
        // 4) 冪等鍵，避免重複建立
        idempotencyKey: `order-${orderId}-cart-${cartId}`,
      }
    );
    return Response.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return Response.json(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
};
