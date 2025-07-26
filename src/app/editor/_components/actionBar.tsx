"use client";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import TextareaAutosize from "react-textarea-autosize";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Save, Download, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useEditorStore } from "../_utils/editorStore";
import { useLinkStore } from "../_utils/linkStore";
import { useFrameStore } from "../_utils/frameStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Checkbox } from "~/components/ui/checkbox";
import Konva from "konva";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { TemplateSaveDialog } from "~/app/_components/templateSaveDialog";
import { useMutationHandlers } from "~/app/_hooks/useMutationHandlers";
import { api } from "~/convex/_generated/api";
import { useMutationState } from "~/app/_hooks/useMutationState";

export function ActionBar() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isTemplateSaveDialogOpen, setIsTemplateSaveDialogOpen] =
    useState(false);
  const [isForwardDialogOpen, setIsForwardDialogOpen] = useState(false);
  const [isSaveDropdownOpen, setIsSaveDropdownOpen] = useState(false);
  const [isMouseOverDropdown, setIsMouseOverDropdown] = useState(false);

  const links = useLinkStore((state) => state.links);
  const frames = useFrameStore((state) => state.frames);
  const isTemplateOwner = useEditorStore((state) => state.isTemplateOwner);
  const uploadQueue = useEditorStore((state) => state.uploadQueue);
  const projectData = useEditorStore((state) => state.projectData);
  const isEditable = useEditorStore((state) => state.isEditable);
  const { updateProject, updateTemplate } = useMutationHandlers();

  if (!projectData) {
    return null;
  }

  const {
    type: projectType,
    id: projectId,
    name: projectName,
    filterIds,
    templateOwnerId,
  } = projectData;

  const handleSave = () => {
    if (uploadQueue.length > 0) {
      return;
    }
    if (projectType === "project") {
      updateProject({
        projectId: String(projectId),
        data: { frames, links },
      });
    }
    if (projectType === "template") {
      updateTemplate({
        templateId: String(projectId),
        data: { frames, links },
      });
    }
  };

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
            <DropdownMenuTrigger asChild disabled={uploadQueue.length > 0}>
              <Button
                size="icon"
                className="h-8 w-8 !rounded-sm bg-[#528FBB] text-white hover:bg-[#5c9dcc] focus-visible:ring-0"
                onClick={() => handleSave()}
                onMouseEnter={() => setIsSaveDropdownOpen(true)}
                onMouseLeave={() => {
                  if (!isMouseOverDropdown) {
                    setIsSaveDropdownOpen(false);
                  }
                }}
                disabled={uploadQueue.length > 0}
              >
                <Save />
              </Button>
            </DropdownMenuTrigger>
            {(isEditable || isTemplateOwner) && (
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
                  onClick={() => handleSave()}
                >
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs hover:!bg-white/5"
                  onClick={() => setIsTemplateSaveDialogOpen(true)}
                >
                  {projectType === "project" ? "Save as template" : "Options"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
          {!isTemplateOwner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    size="icon"
                    className="h-8 w-8 !rounded-sm bg-[#52BB86] text-white hover:bg-[#6BDBA0] focus-visible:ring-0"
                    onClick={() => setIsForwardDialogOpen(true)}
                  >
                    <Send />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Forward</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
        <ExportDialog
          isDialogOpen={isExportDialogOpen}
          setIsDialogOpen={setIsExportDialogOpen}
        />
        <TemplateSaveDialog
          isDialogOpen={isTemplateSaveDialogOpen}
          setIsDialogOpen={setIsTemplateSaveDialogOpen}
          name={projectName}
          data={{ frames, links }}
          method={projectType === "project" ? "post" : "patch"}
          id={String(projectId)}
          saveProject={() => handleSave()}
          isEditable={isEditable}
          filterIds={filterIds}
        />
        <ForwardDialog
          isDialogOpen={isForwardDialogOpen}
          setIsDialogOpen={setIsForwardDialogOpen}
          projectId={projectId}
          templateOwnerId={templateOwnerId}
          isTemplateOwner={isTemplateOwner}
          projectName={projectName}
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
    id: string,
    name: string,
    width: number,
    height: number,
  ) => {
    const stage = Konva.stages[0]?.clone();
    if (!stage) return;
    stage.scale({ x: 1, y: 1 });
    const exportFrameGroup = stage.findOne(`#export${id}`);
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
        handleDownload(frame.id, frame.name, frame.width, frame.height);
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
        toggleExport(frame.id);
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
              <div key={frame.id} className="flex items-center space-x-2">
                <Checkbox
                  id={frame.id}
                  className="border-neutral-400 data-[state=checked]:border-white"
                  checked={frame.selectedForExport}
                  onCheckedChange={() => {
                    toggleExport(frame.id);
                  }}
                />
                <label
                  htmlFor={frame.id}
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

function ForwardDialog(props: {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  projectId: number;
  templateOwnerId: string | undefined;
  isTemplateOwner: boolean;
  projectName: string;
}) {
  const {
    isDialogOpen,
    setIsDialogOpen,
    projectId,
    templateOwnerId,
    isTemplateOwner,
    projectName,
  } = props;

  const [message, setMessage] = useState("");
  const { mutate: createChannel } = useMutationState(api.channel.shareProject);
  const { shareProject } = useMutationHandlers();

  if (!templateOwnerId || isTemplateOwner) {
    return null;
  }

  const handleForward = () => {
    if (message.trim() === "") {
      return;
    }

    void createChannel({
      name: projectName,
      templateOwnerId: templateOwnerId,
      projectId: projectId,
      message: message,
    });
    void shareProject({
      projectId: projectId,
      userId: templateOwnerId,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sidepanel flex min-h-72 select-none flex-col justify-start shadow-none ring-0">
        <DialogHeader className="h-fit">
          <DialogTitle className="text-base">
            Share with template owner
          </DialogTitle>
          <DialogDescription className="text-neutral-300">
            Need help or want to request new features?
            <br />
            This will share your project and start a conversation with the
            template owner.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-1 flex-col justify-between space-y-6">
          <div>
            <div className="pb-1 text-sm font-light text-neutral-400">
              Message
            </div>
            <div className="flex min-h-8 flex-col items-center justify-center rounded-md border border-neutral-700/50 bg-white/5 px-3">
              <TextareaAutosize
                rows={1}
                maxRows={4}
                placeholder="Type a message..."
                className="textarea-scrollbar my-1.5 w-full resize-none items-center bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-400 focus-visible:ring-neutral-500/90"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <Button
            disabled={message.trim() === ""}
            onClick={() => {
              handleForward();
              setIsDialogOpen(false);
              setMessage("");
            }}
          >
            Send & Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
