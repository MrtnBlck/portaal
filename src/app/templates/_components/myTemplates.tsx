"use client";

import { useQuery } from "@tanstack/react-query";
import { getTemplates } from "../get-client";
import { client } from "~/server";
import { GridItem } from "~/app/_components/gridItem";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { TemplateSaveDialog } from "~/app/_components/templateSaveDialog";
import { Fragment, useState } from "react";

export function MyTemplates() {
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const { data } = useQuery(getTemplates);
  const templates = data?.templates;

  if (!templates) return;

  if (templates.length === 0) {
    return (
      <div className="flex h-full justify-center pt-28 text-neutral-400">
        No templates yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => {
        const { filterIds } = template.filterIds;
        const filters = filterIds as number[];

        return (
          <Fragment key={template.id}>
            <TemplateItem
              key={template.id}
              title={template.name}
              id={template.id}
              setIsDialogOpen={setActiveTemplateId}
            />
            <TemplateSaveDialog
              data={template.data}
              id={String(template.id)}
              method="patch"
              name={template.name}
              isEditable={template.isEditable}
              isPublic={template.isPublic}
              key={template.id + "dialog"}
              isDialogOpen={activeTemplateId === template.id}
              setIsDialogOpen={(isOpen) =>
                setActiveTemplateId(isOpen ? template.id : null)
              }
              filterIds={filters}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

function TemplateItem(props: {
  title: string;
  id: number;
  setIsDialogOpen: (id: number) => void;
}) {
  const deleteMutationFn = (id: string) =>
    client.api.templates[":id"].$delete({ param: { id } });
  const renameMutationFn = ({ id, name }: { id: string; name: string }) =>
    client.api.templates[":id"].$patch({
      param: { id },
      json: { name: name },
    });

  return (
    <GridItem
      id={props.id}
      title={props.title}
      deleteMutationFn={deleteMutationFn}
      renameMutationFn={renameMutationFn}
      queryKey="templates"
      routerPath={`/editor/template/${props.id}`}
    >
      <DropdownMenuItem
        className="text-xs hover:!bg-white/5"
        onClick={(e) => {
          e.stopPropagation();
          props.setIsDialogOpen(props.id);
        }}
      >
        Options
      </DropdownMenuItem>
    </GridItem>
  );
}
