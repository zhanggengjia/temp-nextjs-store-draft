import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { VscCode } from 'react-icons/vsc';

function Logo() {
  return (
    <Button size="icon" asChild>
      <Link href="/">
        {/* siz-6 才能用，，等同 h-6 w-6 */}
        <VscCode className="size-6" />
      </Link>
    </Button>
  );
}

export default Logo;
