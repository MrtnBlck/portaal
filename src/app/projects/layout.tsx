import type { Metadata } from "next";
import Container from "../_components/container";
import { Topnav } from "../_components/topnav";

export const metadata: Metadata = {
  title: "Portaal",
  description: "",
  icons: [{ rel: "icon", url: "/P_Square_48.png", sizes: "48x48" }],
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Container className="min-h-screen">
      <Topnav />
      <div className="flex w-full flex-1 text-white">{children}</div>
    </Container>
  );
}
