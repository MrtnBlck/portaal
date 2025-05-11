import { queryOptions } from "@tanstack/react-query";
import { client } from "~/server";

export const getTemplates = queryOptions({
  queryKey: ["templates"],
  queryFn: () => client.api.templates.$get().then((res) => res.json()),
});
