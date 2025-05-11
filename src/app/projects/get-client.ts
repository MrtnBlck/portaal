import { queryOptions } from "@tanstack/react-query";
import { client } from "~/server";

export const getProjects = queryOptions({
  queryKey: ["projects"],
  queryFn: () => client.api.projects.$get().then((res) => res.json()),
});

export const getTemplateDataById = (id: number) =>
  queryOptions({
    queryKey: ["publicTemplate", id],
    queryFn: () =>
      client.api.publicTemplate[":id"]
        .$get({ param: { id: id.toString() } })
        .then((res) => res.json()),
  });
