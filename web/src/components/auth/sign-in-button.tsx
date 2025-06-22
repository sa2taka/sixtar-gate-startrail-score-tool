"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const SignInButton = () => {
  return (
    <Button variant="default" onClick={() => signIn("google")}>
      Googleでログイン
    </Button>
  );
};
