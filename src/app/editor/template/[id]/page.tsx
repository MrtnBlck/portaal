"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import { Spinner } from "~/components/ui/spinner";
import Editor from "../../_components/editor";
import { getTemplateById } from "../../get-client";

export default function EditorPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise); // Unwrap the params Promise
  const templateId = params.id;
  const { data } = useQuery(getTemplateById(Number(templateId)));
  const template = data?.template;

  if (!template)
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Spinner size="lg" className="bg-black dark:bg-white" />
      </div>
    );

  const { filterIds } = template.filterIds;
  const filters = filterIds as number[];

  return (
    <Editor
      data={template.data}
      id={templateId}
      name={template.name}
      type="template"
      isEditable={true}
      isTemplateOwner={true}
      filterIds={filters}
    />
  );
}
