"use client";

import Image from "next/image";

export const Header = () => {
  return (
    <div className="flex items-center gap-4">
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
      <div className="text-2xl font-bold">SIXTAR GATE STARTRAIL</div>
    </div>
  );
};