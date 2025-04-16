import { Topnav } from "./_components/topnav";
import { Button } from "~/components/ui/button";

// avoid page caching
// export const dynamic = "force-dynamic";

export default async function HomePage() {
  /* const test = await db.query.posts.findMany();
  console.log(test); */

  return (
    <main className="flex min-h-screen justify-center bg-[#080808]">
      <div className="relative z-30 w-full max-w-screen-2xl">
        <Topnav />
        <div className="flex h-full flex-col items-center text-white">
          <div className="pt-24 text-2xl font-bold sm:text-4xl lg:pt-36 lg:text-5xl">
            Simplify the design process
          </div>
          <div className="pt-1 text-xs font-light text-neutral-200 sm:text-sm lg:pt-2 lg:text-base">
            Create templates, let your clients fill in the content.
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="none"
              className="rounded-full bg-white text-black"
              size="responsive"
            >
              Get started
            </Button>
            <Button
              variant="none"
              className="rounded-full border border-white"
              size="responsive"
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
