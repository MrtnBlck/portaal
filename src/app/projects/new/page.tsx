import { Templates } from "./_components/templates";
import { TitleInput } from "./_components/titleInput";
import { Filters } from "./_components/filters";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { TitleBar } from "../../_components/titleBar";
import { getFilters, getPublicTemplates } from "./get-client";

export default async function NewProjectPage() {
  const client = new QueryClient();
  await client.fetchQuery(getFilters);
  await client.fetchQuery(getPublicTemplates);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="flex flex-1 flex-col">
        <TitleBar title="Create New" />
        <div className="flex flex-1 gap-5">
          <div className="w-80">
            <TitleInput />
            <Filters />
          </div>
          <Templates />
        </div>
      </div>
    </HydrationBoundary>
  );
}
