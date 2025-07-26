import ChatConversations from "~/components/custom/chat/conversations";
import ChatHeader from "~/components/custom/chat/header";

export default function ChannelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ChatConversations />
      <div className="flex max-w-full flex-1 flex-col gap-3 overflow-hidden">
        <ChatHeader />
        {children}
      </div>
    </>
  );
}
