"use client";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Save, Download, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useEditorStore, useFrameStore } from "../store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";
import Konva from "konva";
import { cn } from "~/lib/utils";

export function ActionBar() {
  const [stageScaleInput, setStageScaleInput] = useState("100%");
  const stageScale = useEditorStore((state) => state.stageScale);
  const setStageScale = useEditorStore((state) => state.setStageScale);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    <div className="sidepanel flex items-center justify-between !p-1.5 !px-2">
      <Input
        className="w-min-0 h-7 w-16 !rounded-sm border border-neutral-700/50 bg-white/5 text-center text-neutral-400 hover:text-neutral-100"
        value={stageScaleInput}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
      />
      <div className="flex gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="icon"
                  className="h-8 w-8 !rounded-sm bg-[#5952BB] text-white hover:bg-[#6B63E6]"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Download />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="icon"
                  className="h-8 w-8 !rounded-sm bg-[#528FBB] text-white"
                  disabled
                >
                  <Save />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="icon"
                  className="h-8 w-8 !rounded-sm bg-[#52BB86] text-white"
                  disabled
                >
                  <Send />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Forward</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <ExportDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>
    </div>
  );
}

// TODO: Change to Sheet component
function ExportDialog({
  isDialogOpen,
  setIsDialogOpen,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}) {
  const getExportableFrames = useFrameStore(
    (state) => state.getExportableFrames,
  );
  const toggleExport = useFrameStore((state) => state.toggleExport);
  const frames = getExportableFrames();

  const handleDownload = (ID: string, name: string) => {
    const stage = Konva.stages[0]?.clone();
    if (!stage) return;
    stage.scale({ x: 1, y: 1 });
    const frame = stage.findOne(`#export${ID}`);
    if (!frame) return;
    const uri = frame.toDataURL();
    stage.destroy();
    downloadURI(uri, `${name}.png`);
  };

  const exportSelectedFrames = () => {
    frames.forEach((frame) => {
      if (frame.selectedForExport) {
        handleDownload(frame.ID, frame.name);
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
