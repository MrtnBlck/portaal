"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { cn } from "~/lib/utils";
import { useNewPageStore } from "../newPageStore";
import { getFilters } from "../get-client";

type filter = {
  id: number;
  name: string;
  description: string | null;
  common: boolean;
};

export function Filters() {
  const setFilters = useNewPageStore((state) => state.setFilters);
  // eslint-disable-next-line
  const _filters = useNewPageStore((state) => state.filters);
  const { data } = useQuery(getFilters);
  const filterGroups = data?.filterGroups;

  useEffect(() => {
    if (filterGroups) {
      const filters = filterGroups.flatMap((group) => group.filters);
      const selectedFilters = filters.map((filter) => ({
        id: filter.id,
        selected: false,
      }));
      setFilters(selectedFilters);
    }
  }, [filterGroups, setFilters]);

  if (!filterGroups) return null;

  return (
    <>
      <div className="flex flex-col gap-2 pt-3">
        {filterGroups.map((filterGroup) => (
          <FilterGroup
            key={filterGroup.id}
            title={filterGroup.name}
            filters={filterGroup.filters}
          />
        ))}
      </div>
    </>
  );
}

function FilterGroup({ title, filters }: { title: string; filters: filter[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const commonFilters = filters.filter((x) => x.common);
  const uncommonFilters = filters.filter((x) => !x.common);

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full flex-row items-center justify-between pr-1 font-light focus-visible:ring-0">
          {title}
          <ChevronsUpDown className="size-3.5" />
        </CollapsibleTrigger>
        <div className="flex flex-col gap-1.5 pt-1.5">
          {commonFilters.map((filter) => (
            <FilterItem
              id={filter.id}
              key={filter.id}
              title={filter.name}
              info={filter.description ?? ""}
            />
          ))}
        </div>
        <CollapsibleContent className="flex flex-col gap-1.5 pt-1.5">
          {uncommonFilters.map((filter) => (
            <FilterItem
              id={filter.id}
              key={filter.id}
              title={filter.name}
              info={filter.description ?? ""}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}

function FilterItem({
  id,
  title,
  info,
}: {
  id: number;
  title: string;
  info: string;
}) {
  const getFilter = useNewPageStore((state) => state.getFilter);
  const toggleFilter = useNewPageStore((state) => state.toggleFilter);
  const checked = getFilter(id)?.selected ?? false;

  return (
    <div
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-lg border border-neutral-400/5 bg-neutral-600/10 px-3.5 py-2.5",
        !checked && "hover:multi-[bg-neutral-600/15;border-neutral-600/15]",
        checked && "border-neutral-600/50",
      )}
      onClick={() => {
        toggleFilter(id);
      }}
    >
      <Checkbox
        className="rounded-sm border-0 bg-white/10 shadow-[inset_0px_0px_2px_1px_rgba(255,_255,_255,_0.1)] data-[state=checked]:multi-[bg-white/10;text-transparent;shadow-[inset_0px_0px_5px_3px_rgba(255,_255,_255,_0.30)];border-0]"
        checked={checked}
        onCheckedChange={() => toggleFilter(id)}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="flex flex-col gap-[5px] py-1 pl-1.5">
        <span className="text-sm font-light leading-none text-neutral-200">
          {title}
        </span>
        <span className="text-xs font-light leading-none text-neutral-400">
          {info}
        </span>
      </div>
    </div>
  );
}
