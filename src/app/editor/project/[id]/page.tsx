"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { Spinner } from "~/components/ui/spinner";
import Editor from "../../_components/editor";
import { getProjectById } from "../../get-client";

export default function EditorPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise); // Unwrap the params Promise
  const projectId = params.id;
  const { data } = useQuery(getProjectById(Number(projectId)));
  const project = data?.project;

  if (!project)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner size="lg" className="bg-black dark:bg-white" />
      </div>
    );

  return <Editor type="project" project={project} />;
}
