import { queryOptions } from "@tanstack/react-query";
import { client } from "~/server";

export const getPublicTemplates = queryOptions({
  queryKey: ["publicTemplates"],
  queryFn: () => client.api.publicTemplates.$get().then((res) => res.json()),
});

export const getFilters = queryOptions({
  queryKey: ["filters"],
  queryFn: () => client.api.filters.$get().then((res) => res.json()),
});
