"use client";

import { AspectRatio } from "~/components/ui/aspect-ratio";
import { useNewPageStore } from "../newPageStore";
import { cn } from "~/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getPublicTemplates } from "../get-client";
import Image from "next/image";

export function Templates() {
  // eslint-disable-next-line
  const _filters = useNewPageStore((state) => state.filters);
  const selectedFilters = useNewPageStore((state) => state.getSelectedFilters);
  const { data } = useQuery(getPublicTemplates);
  const templates = data?.templates;

  if (!templates) return null;

  return (
    <div className="flex flex-1 flex-col">
      <span className="pb-2 font-light">Available templates</span>
      <div className="grid h-fit flex-1 auto-rows-min grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => {
          const sFilters = selectedFilters();
          const { filterIds } = template.filterIds;
          const filters = filterIds as number[];
          const hasSelectedFilters = sFilters.every((f) =>
            filters.includes(f.id),
          );
          if (!hasSelectedFilters) return null;

          return (
            <TemplateItem
              key={template.id}
              title={template.name}
              id={template.id}
              editable={template.isEditable}
              imageURL={template.previewImageURL}
            />
          );
        })}
      </div>
    </div>
  );
}

function TemplateItem(props: {
  id: number;
  title: string;
  editable: boolean;
  imageURL: string | null;
}) {
  const selectedTemplate = useNewPageStore((state) => state.selectedTemplate);
  const setSelectedTemplate = useNewPageStore(
    (state) => state.setSelectedTemplate,
  );

  const isSelected = selectedTemplate === props.id;

  return (
    <div
      className="group h-fit w-full"
      onClick={() => setSelectedTemplate(props.id)}
    >
      <AspectRatio
        ratio={4 / 5}
        className={cn(
          "rounded-lg border border-neutral-400/5 bg-neutral-600/10",
          !isSelected &&
            "hover:multi-[bg-neutral-600/15;border-neutral-600/15]",
          isSelected && "border-neutral-600/50",
          !props.imageURL && "flex flex-col items-center justify-center",
        )}
      >
        {props.imageURL ? (
          <Image
            src={props.imageURL}
            fill
            alt={props.title}
            className="rounded-lg"
          />
        ) : (
          <div className="text-sm font-light text-neutral-400">
            No preview available
          </div>
        )}
      </AspectRatio>
      <div className="flex items-end justify-between pt-1 text-sm">
        <div
          className={cn(
            "text-neutral-400",
            !isSelected && "group-hover:text-neutral-200",
            isSelected && "text-white",
          )}
        >
          {props.title}
        </div>
        {props.editable && <div className="text-neutral-500">Editable</div>}
      </div>
    </div>
  );
}
