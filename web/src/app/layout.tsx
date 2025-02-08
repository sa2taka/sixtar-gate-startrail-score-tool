import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { SignInButton } from "@/components/auth/signin-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SIXTAR GATE STARTRAIL スコア管理",
  description: "SIXTAR GATE STARTRAILのスコアを管理・分析するツール",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold">
                    SIXTAR GATE STARTRAIL
                  </h1>
                  <SignInButton />
                </div>
              </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
