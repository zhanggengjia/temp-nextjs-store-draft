'use client';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

// Stripe 前端公開金鑰初始化（publishable key）
// loadStripe 會回傳一個 Promise，用於後面 Stripe Provider
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

function CheckoutPage() {
  // 從 URL 搜尋參數取出 orderId 與 cartId，例如 /checkout?orderId=123&cartId=456
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const cartId = searchParams.get('cartId');

  // 定義 fetchClientSecret：Stripe 會呼叫這個 function 去取得付款用的 clientSecret
  // 使用 useCallback 是為了避免每次 re-render 都建立新的函式，造成 Provider 重刷
  const fetchClientSecret = useCallback(async () => {
    // 呼叫後端 API，建立或取得 Stripe PaymentIntent，並回傳 clientSecret
    const response = await axios.post('/api/payment', { orderId, cartId });
    return response.data.clientSecret;
  }, []);

  // Stripe EmbeddedCheckoutProvider 需要的設定，必須包含 fetchClientSecret
  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      {/*
        EmbeddedCheckoutProvider：Stripe 提供的 Context，內部會自動執行 fetchClientSecret()
        stripe={stripePromise} → Stripe 初始化物件
        options={options} → 傳入自訂的 fetchClientSecret
      */}
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        {/* EmbeddedCheckout：Stripe 的內嵌結帳 UI，會自動顯示付款表單 */}
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

export default CheckoutPage;
