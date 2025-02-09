"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./sign-in-button";
import { SignOutButton } from "./sign-out-button";

export const AuthButton = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return session ? <SignOutButton /> : <SignInButton />;
};
