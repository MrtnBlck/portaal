import { queryOptions } from "@tanstack/react-query";
import { client } from "~/server";

export const getAllFilters = queryOptions({
  queryKey: ["allFilters"],
  queryFn: () => client.api.allFilters.$get().then((res) => res.json()),
});
