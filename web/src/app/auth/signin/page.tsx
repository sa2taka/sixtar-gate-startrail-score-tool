import { SignInButton } from "@/components/auth/signin-button";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">SIXTAR GATE STARTRAIL</h2>
          <p className="mt-2 text-sm text-gray-600">スコア管理ツール</p>
        </div>
        <div className="mt-8 flex justify-center">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
