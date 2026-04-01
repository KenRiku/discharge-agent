import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "AfterCall — AI Discharge Follow-Up",
  description: "AI-powered post-discharge patient follow-up system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
