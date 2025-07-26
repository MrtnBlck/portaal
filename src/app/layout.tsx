import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { cn } from "~/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import RQProvider from "./_providers/RQProvider";
import ConvexClientProvider from "./_providers/ConvexProvider";

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
      <ConvexClientProvider>
        <RQProvider>
          <html
            lang="en"
            className={cn(
              GeistSans.className,
              "dark h-screen w-screen overflow-hidden",
            )}
          >
            <body className="bg-[#1A1A1A]">{children}</body>
          </html>
        </RQProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
