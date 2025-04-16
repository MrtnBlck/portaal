import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { cn } from "~/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Portaal",
  description: "",
  icons: [{ rel: "icon", url: "/P_Square_48.png", sizes: "48x48" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn(
          GeistSans.className,
          "dark h-screen w-screen overflow-hidden",
        )}
      >
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
