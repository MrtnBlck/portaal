import { Button } from "~/components/ui/button";
import { Logo } from "./logo";
import { SignInButton, UserButton } from "@clerk/nextjs";

export function Topnav({ usedIn }: { usedIn?: "dashboard" | "home" }) {
  return (
    <div className="flex max-h-12 w-full items-center justify-between p-4">
      <Logo className="w-16" />
      {usedIn === "dashboard" ? (
        <UserButton />
      ) : (
        <div className="text-sm text-neutral-300 hover:text-white">
          <SignInButton />
        </div>
      )}
    </div>
  );
}
