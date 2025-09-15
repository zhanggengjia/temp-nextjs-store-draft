// AddToCart.client.tsx
'use client';
import { useState } from 'react';
import SelectProductAmount, { Mode } from './SelectProductAmount';
import FormContainer from '../form/FormContainer';
import { SubmitButton, ProductSignInButton } from '../form/Buttons';
import { addToCartAction } from '@/utils/actions';

export default function AddToCartClient({
  productId,
  signedIn,
}: {
  productId: string;
  signedIn: boolean;
}) {
  const [amount, setAmount] = useState(1);

  return (
    <div className="mt-4">
      <SelectProductAmount
        mode={Mode.SingleProduct}
        amount={amount}
        setAmount={setAmount}
      />
      {signedIn ? (
        <FormContainer action={addToCartAction}>
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="amount" value={amount} />
          <SubmitButton text="add to cart" className="mt-8" />
        </FormContainer>
      ) : (
        <ProductSignInButton />
      )}
    </div>
  );
}
