"use client";

import type { EditorData } from "../editor/_utils/editorTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "~/server";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { getAllFilters } from "./_utils/get-client";

export function TemplateSaveDialog(props: {
  id: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  name: string;
  data: EditorData;
  isPublic?: boolean;
  isEditable?: boolean;
  method: "post" | "patch";
  filterIds?: number[];
  saveProject?: () => void;
}) {
  const [isPublic, setIsPublic] = useState(props.isPublic ?? false);
  const [templateName, setTemplateName] = useState(props.name);
  const [isEditable, setIsEditable] = useState(props.isEditable ?? false);
  const [dialogFilterIds, setDialogFilterIds] = useState<number[]>(
    props.filterIds ?? [],
  );

  const queryClient = useQueryClient();
  const postFn = (data: EditorData) =>
    client.api.templates
      .$post({
        json: {
          name: templateName,
          data: data,
          isEditable: isEditable,
          isPublic: isPublic,
          filterIds: { filterIds: dialogFilterIds },
        },
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Template ID is required");
        }
        return res.json();
      });
  const patchFn = (data: EditorData) =>
    client.api.templates[":id"]
      .$patch({
        param: { id: props.id },
        json: {
          name: templateName,
          data: data,
          isEditable: isEditable,
          isPublic: isPublic,
          filterIds: { filterIds: dialogFilterIds },
        },
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Template ID is required");
        }
        return res.json();
      });

  const { mutate } = useMutation({
    mutationFn: props.method === "post" ? postFn : patchFn,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["templates"] });
      if (props.method === "post") {
        const id = (response as { id: number }).id;
        window.open(`/editor/template/${id}`, "_blank");
      }
    },
  });

  const handleBlur = () => {
    if (templateName === "") {
      setTemplateName(props.name);
    }
  };

  const handleCheckboxChange = (id: number) => {
    if (dialogFilterIds.includes(id)) {
      setDialogFilterIds(dialogFilterIds.filter((filterId) => filterId !== id));
    } else {
      setDialogFilterIds([...dialogFilterIds, id]);
    }
  };

  const { data: allFilters } = useQuery(getAllFilters);
  const filters = allFilters?.filters;

  if (!filters) return null;

  return (
    <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
      <DialogContent className="sidepanel flex select-none flex-col justify-start shadow-none">
        <DialogHeader className="h-fit">
          <DialogTitle className="text-base">
            {props.method === "post" ? "Save as template" : "Template options"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 flex-col justify-between space-y-6">
          <div>
            <div className="pb-1 text-sm font-light text-neutral-400">
              Template title
            </div>
            <Input
              className="h-8 !rounded-md border border-neutral-700/50 bg-white/5 text-sm text-neutral-100 focus-visible:ring-neutral-500/90"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onBlur={handleBlur}
            />
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  className="border-neutral-400 data-[state=checked]:border-white"
                  checked={isPublic}
                  onCheckedChange={() => {
                    setIsPublic(!isPublic);
                  }}
                />
                <label
                  htmlFor={"isPublic"}
                  className={cn(
                    "text-sm leading-none text-neutral-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    isPublic ? "text-white" : "",
                  )}
                >
                  Public
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEditable"
                  className="border-neutral-400 data-[state=checked]:border-white"
                  checked={isEditable && isPublic}
                  onCheckedChange={() => {
                    setIsEditable(!isEditable);
                  }}
                  disabled={!isPublic}
                />
                <label
                  htmlFor={"isEditable"}
                  className={cn(
                    "text-sm leading-none text-neutral-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    isEditable && isPublic ? "text-white" : "",
                  )}
                >
                  Editable
                </label>
              </div>
            </div>
            <div className="py-3 text-sm font-light text-neutral-400">
              Filters
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filters.map((filter) => (
                <div className="flex items-center space-x-2" key={filter.id}>
                  <Checkbox
                    id={String(filter.id)}
                    className="border-neutral-400 data-[state=checked]:border-white"
                    checked={dialogFilterIds.includes(filter.id)}
                    onCheckedChange={() => {
                      handleCheckboxChange(filter.id);
                    }}
                  />
                  <label
                    htmlFor={String(filter.id)}
                    className={cn(
                      "text-sm leading-none text-neutral-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                      isPublic ? "text-white" : "",
                    )}
                  >
                    {filter.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Button
            onClick={() => {
              props.setIsDialogOpen(false);
              if (props.saveProject) {
                props.saveProject();
              }
              void mutate(props.data);
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
