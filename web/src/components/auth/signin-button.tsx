import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button variant="outline" onClick={() => signOut()}>
        ログアウト
      </Button>
    );
  }

  return (
    <Button variant="default" onClick={() => signIn("google")}>
      Googleでログイン
    </Button>
  );
}
