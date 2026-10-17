"use client";
import dynamic from "next/dynamic";

// The chat code is only downloaded after the page has loaded, so it never slows the first paint.
const ChatWidget = dynamic(() => import("./ChatWidget").then((m) => m.ChatWidget), { ssr: false });

export function ChatLoader(props: React.ComponentProps<typeof ChatWidget>) {
  return <ChatWidget {...props} />;
}
