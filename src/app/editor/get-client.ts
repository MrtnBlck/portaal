import { queryOptions } from "@tanstack/react-query";
import { client } from "~/server";

export const getProjectById = (id: number) =>
  queryOptions({
    queryKey: ["projects", id],
    queryFn: () =>
      client.api.projects[":id"]
        .$get({ param: { id: id.toString() } })
        .then((res) => res.json()),
  });

export const getTemplateById = (id: number) =>
  queryOptions({
    queryKey: ["templates", id],
    queryFn: () =>
      client.api.templates[":id"]
        .$get({ param: { id: id.toString() } })
        .then((res) => res.json()),
  });
