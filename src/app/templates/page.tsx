import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getTemplates } from "./get-client";
import { TitleBar } from "../_components/titleBar";
import { MyTemplates } from "./_components/myTemplates";
import { getAllFilters } from "../_components/_utils/get-client";

export default async function TemplatePage() {
  const client = new QueryClient();
  await client.prefetchQuery(getTemplates);
  await client.fetchQuery(getAllFilters);

  return (
    <HydrationBoundary state={dehydrate(client)}>
      <div className="flex flex-1 flex-col">
        <TitleBar title="My Templates" />
        <MyTemplates />
      </div>
    </HydrationBoundary>
  );
}
