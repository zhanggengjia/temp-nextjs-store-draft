'use client';

import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const cartId = searchParams.get('cartId');

  const fetchClientSecret = useCallback(async () => {
    const res = await axios.post('/api/payment', { orderId, cartId });
    return res.data.clientSecret;
  }, [orderId, cartId]); // ← 建議把依賴補上

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
