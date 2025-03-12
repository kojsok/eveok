// components/LoginButton.tsx
import Link from "next/link";
import Image from 'next/image'

export default function LoginButton() {
  return (
    <Link href="/api/auth/login">
      
        <Image
          src="/eve-login.png"
          alt="EVE Online Logo"
          width={240}
          height={240}
          className="mt-6"
        />
        

    </Link>
  );
}

