"use client";

import { Button } from "~/components/ui/button";
import { Logo } from "./logo";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export function Topnav() {
  const pathname = usePathname();
  const inner = pathname !== "/";

  return (
    <div className="flex max-h-12 w-full items-center justify-between py-8">
      <Link href={inner ? "/projects" : "/"}>
        <Logo className="h-6" />
      </Link>
      {inner ? (
        <TopnavInner />
      ) : (
        <div className="font-medium text-neutral-300 hover:text-white">
          <SignInButton />
        </div>
      )}
    </div>
  );
}

function TopnavInner() {
  const router = useRouter();
  const pathname = usePathname();
  const isTemplatesPage = pathname === "/templates";
  const isProjectsPage = pathname === "/projects";

  return (
    <div className="flex gap-6">
      {!isTemplatesPage && (
        <Button
          size="none"
          variant="none"
          className="text-neutral-200/90 hover:text-white"
          onClick={() => {
            router.push("/templates");
          }}
        >
          My Templates
        </Button>
      )}
      {!isProjectsPage && (
        <Button
          size="none"
          variant="none"
          className="text-neutral-200/90 hover:text-white"
          onClick={() => {
            router.push("/projects");
          }}
        >
          My Projects
        </Button>
      )}
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "size-8",
          },
        }}
      />
    </div>
  );
}
