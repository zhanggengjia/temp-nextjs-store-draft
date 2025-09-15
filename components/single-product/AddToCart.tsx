// AddToCart.server.tsx
import { auth } from '@clerk/nextjs/server';
import AddToCartClient from './AddToCartClient';

export default async function AddToCart({ productId }: { productId: string }) {
  const { userId } = await auth(); // 伺服器就知道是否登入
  return <AddToCartClient productId={productId} signedIn={!!userId} />;
}
