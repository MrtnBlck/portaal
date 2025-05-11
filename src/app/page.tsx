import { SignInButton } from "@clerk/nextjs";
import { Topnav } from "./_components/topnav";
import { Button } from "~/components/ui/button";

// avoid page caching
// export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <main className="flex min-h-screen justify-center bg-[#080808]">
      <div className="relative z-30 w-full max-w-screen-2xl px-6">
        <Topnav />
        <div className="flex h-full flex-col items-center text-white">
          <div className="pt-24 text-2xl font-bold sm:text-4xl lg:pt-36 lg:text-5xl">
            Simplify the design process
          </div>
          <div className="pt-1 font-medium text-white/65 lg:pt-2">
            Create templates, let your clients fill in the content.
          </div>
          <div className="flex gap-4 pt-4">
            <SignInButton>
              <Button
                variant="none"
                className="rounded-full bg-white px-6 py-2 text-lg font-medium text-black"
                size="none"
              >
                Get started
              </Button>
            </SignInButton>
            <Button
              variant="none"
              className="rounded-full border border-white px-6 py-2 text-lg font-medium"
              size="none"
            >
              Try it out
            </Button>
          </div>
        </div>
      </div>
      <div className="wrapper absolute">
        <div className="gradient gradient-1"></div>
        <div className="gradient gradient-2"></div>
        <div className="gradient gradient-3"></div>
      </div>
    </main>
  );
}
