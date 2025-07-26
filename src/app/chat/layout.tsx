import type { Metadata } from "next";
import { Topnav } from "../_components/topnav";
import { TitleBar } from "../_components/titleBar";

export const metadata: Metadata = {
  title: "Portaal | Chat",
  description: "",
  icons: [{ rel: "icon", url: "/P_Square_48.png", sizes: "48x48" }],
};

export default function ChatLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex max-h-screen min-h-screen w-full max-w-screen-2xl flex-col items-center justify-center px-6 pb-6">
      <Topnav />
      <div className="flex w-full flex-1 flex-col overflow-hidden text-white">
        <TitleBar title="Messages" />
        <div className="flex size-full flex-1 flex-row gap-3 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
