import { Projects } from "./_components/projects";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getProjects } from "./get-client";
import { TitleBar } from "../_components/titleBar";

export default async function ProjectsPage() {
  const client = new QueryClient();
  await client.prefetchQuery(getProjects);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="flex flex-1 flex-col">
        <TitleBar title="My Projects" />
        <Projects />
      </div>
    </HydrationBoundary>
  );
}
