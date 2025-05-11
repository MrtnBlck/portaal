"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../get-client";
import { client } from "~/server";
import { GridItem } from "~/app/_components/gridItem";

export function Projects() {
  const { data } = useQuery(getProjects);
  const projects = data?.projects;

  if (!projects) return;

  if (projects.length === 0) {
    return (
      <div className="flex h-full justify-center pt-28 text-neutral-400">
        No projects yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectsItem key={project.id} title={project.name} id={project.id} />
      ))}
    </div>
  );
}

function ProjectsItem(props: { title: string; id: number }) {
  const deleteMutationFn = (id: string) =>
    client.api.projects[":id"].$delete({ param: { id } });
  const renameMutationFn = ({ id, name }: { id: string; name: string }) =>
    client.api.projects[":id"].$patch({
      param: { id },
      json: { name: name },
    });

  return (
    <GridItem
      id={props.id}
      title={props.title}
      deleteMutationFn={deleteMutationFn}
      renameMutationFn={renameMutationFn}
      queryKey="projects"
      routerPath={`/editor/project/${props.id}`}
    />
  );
}
