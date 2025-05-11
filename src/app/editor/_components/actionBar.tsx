"use client";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Save, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useEditorStore } from "../_utils/editorStore";
import { useLinkStore } from "../_utils/linkStore";
import { useFrameStore } from "../_utils/frameStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";
import Konva from "konva";
import { cn } from "~/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "~/server";
import type { EditorData } from "~/app/editor/_utils/editorTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { TemplateSaveDialog } from "~/app/_components/templateSaveDialog";

export function ActionBar(props: {
  id: string;
  name: string;
  type: "project" | "template";
  isPublic?: boolean;
  isEditable: boolean;
  filterIds?: number[];
}) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isTemplateSaveDialogOpen, setIsTemplateSaveDialogOpen] =
    useState(false);
  const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
  const [isMouseOverDropdown, setIsMouseOverDropdown] = useState(false);

  const links = useLinkStore((state) => state.links);
  const frames = useFrameStore((state) => state.frames);
  const isTemplateOwner = useEditorStore((state) => state.isTemplateOwner);

  const queryClient = useQueryClient();
  const mutFn =
    props.type === "project"
      ? (data: EditorData) =>
          client.api.projects[":id"].$patch({
            param: { id: props.id },
            json: { data },
          })
      : (data: EditorData) =>
          client.api.templates[":id"].$patch({
            param: { id: props.id },
            json: { data },
          });
  const { mutate } = useMutation({
    mutationFn: mutFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <div className="sidepanel flex items-center justify-between !p-1.5 !px-2">
      <StageScaleInput />
      <div className="flex gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="icon"
                  className="h-8 w-8 !rounded-sm bg-[#5952BB] text-white hover:bg-[#6B63E6] focus-visible:ring-0"
                  onClick={() => setIsExportDialogOpen(true)}
                >
                  <Download />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenu
            open={isSaveDropdownOpen}
            onOpenChange={setIsSaveDropdownOpen}
            modal={false}
          >
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="h-8 w-8 !rounded-sm bg-[#528FBB] text-white hover:bg-[#5c9dcc] focus-visible:ring-0"
                onClick={() => {
                  mutate({ frames, links });
                }}
                onMouseEnter={() => setIsSaveDropdownOpen(true)}
                onMouseLeave={() => {
                  if (!isMouseOverDropdown) {
                    setIsSaveDropdownOpen(false);
                  }
                }}
              >
                <Save />
              </Button>
            </DropdownMenuTrigger>
            {(props.isEditable || isTemplateOwner) && (
              <DropdownMenuContent
                className="customPopup min-w-20"
                onMouseEnter={() => setIsMouseOverDropdown(true)}
                onMouseLeave={() => {
                  setIsSaveDropdownOpen(false);
                  setIsMouseOverDropdown(false);
                }}
              >
                <DropdownMenuItem
                  className="text-xs hover:!bg-white/5"
                  onClick={() => {
                    mutate({ frames, links });
                  }}
                >
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs hover:!bg-white/5"
                  onClick={() => setIsTemplateSaveDialogOpen(true)}
                >
                  {props.type === "project" ? "Save as template" : "Options"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="icon"
                  className="h-8 w-8 !rounded-sm bg-[#52BB86] text-white focus-visible:ring-0"
                  disabled
                >
                  <Send />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Forward</p>
            </TooltipContent>
          </Tooltip> */}
        </TooltipProvider>
        <ExportDialog
          isDialogOpen={isExportDialogOpen}
          setIsDialogOpen={setIsExportDialogOpen}
        />
        <TemplateSaveDialog
          isDialogOpen={isTemplateSaveDialogOpen}
          setIsDialogOpen={setIsTemplateSaveDialogOpen}
          name={props.name}
          data={{ frames, links }}
          method={props.type === "project" ? "post" : "patch"}
          id={props.id}
          saveProject={() => mutate({ frames, links })}
          isEditable={props.isEditable}
          isPublic={props.isPublic}
          filterIds={props.filterIds}
        />
      </div>
    </div>
  );
}

function StageScaleInput() {
  const [stageScaleInput, setStageScaleInput] = useState("100%");
  const stageScale = useEditorStore((state) => state.stageScale);
  const setStageScale = useEditorStore((state) => state.setStageScale);

  useEffect(() => {
    setStageScaleInput(`${Math.round(stageScale * 100)}%`);
  }, [stageScale]);

  const handleOnBlur = () => {
    let value = stageScaleInput;
    if (value.includes("%")) {
      //remove percentage sign
      value = value.replace("%", "");
    }
    if (value !== "") {
      const newValue = Math.min(Math.max(parseInt(value), 10), 999);
      setStageScale(newValue / 100);
    } else {
      setStageScaleInput(`${Math.round(stageScale * 100)}%`);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^(?:[0-9]*%?)$/;
    if (regex.test(value)) {
      setStageScaleInput(value);
    }
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleOnBlur();
    }
  };

  return (
    <Input
      className="w-min-0 h-7 w-16 !rounded-sm border border-neutral-700/50 bg-white/5 text-center text-neutral-400 hover:text-neutral-100 focus-visible:ring-neutral-500/90"
      value={stageScaleInput}
      onBlur={handleOnBlur}
      onChange={handleOnChange}
      onKeyDown={handleOnKeyDown}
    />
  );
}

function ExportDialog(props: {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}) {
  const getExportableFrames = useFrameStore(
    (state) => state.getExportableFrames,
  );
  const toggleExport = useFrameStore((state) => state.toggleExport);
  const frames = getExportableFrames();

  const handleDownload = (
    ID: string,
    name: string,
    width: number,
    height: number,
  ) => {
    const stage = Konva.stages[0]?.clone();
    if (!stage) return;
    stage.scale({ x: 1, y: 1 });
    const exportFrameGroup = stage.findOne(`#export${ID}`);
    if (!exportFrameGroup) {
      stage.destroy();
      return;
    }
    const uri = exportFrameGroup.toDataURL({
      width: width,
      height: height,
    });
    stage.destroy();
    downloadURI(uri, `${name}.png`);
  };

  const exportSelectedFrames = () => {
    frames.forEach((frame) => {
      if (frame.selectedForExport) {
        handleDownload(frame.ID, frame.name, frame.width, frame.height);
      }
    });
  };

  const downloadURI = (uri: string, name: string) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectNoneOrAll = () => {
    const allSelected = !frames.some((frame) => frame.selectedForExport);
    frames.forEach((frame) => {
      if (allSelected ? !frame.selectedForExport : frame.selectedForExport) {
        toggleExport(frame.ID);
      }
    });
  };

  return (
    <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
      <DialogContent className="sidepanel flex min-h-60 select-none flex-col justify-start shadow-none">
        <DialogHeader className="h-fit">
          <DialogTitle className="text-base">Export frames</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 flex-col justify-between space-y-6">
          <div className="flex flex-col gap-4">
            {frames.map((frame) => (
              <div key={frame.ID} className="flex items-center space-x-2">
                <Checkbox
                  id={frame.ID}
                  className="border-neutral-400 data-[state=checked]:border-white"
                  checked={frame.selectedForExport}
                  onCheckedChange={() => {
                    toggleExport(frame.ID);
                  }}
                />
                <label
                  htmlFor={frame.ID}
                  className={cn(
                    "text-sm leading-none text-neutral-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    frame.selectedForExport ? "text-white" : "",
                  )}
                >
                  {frame.name}
                </label>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              className="text-neutral-white w-fit border border-neutral-500 font-normal hover:border-neutral-400 hover:bg-white/10"
              size="sm"
              variant="none"
              onClick={exportSelectedFrames}
              disabled={!frames.some((frame) => frame.selectedForExport)}
            >
              Export
            </Button>
            <Button
              className="text-neutral-white w-fit border border-neutral-500 font-normal hover:border-neutral-400 hover:bg-white/10"
              size="sm"
              variant="none"
              onClick={selectNoneOrAll}
            >
              {frames.some((frame) => frame.selectedForExport)
                ? "Select none"
                : "Select all"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
