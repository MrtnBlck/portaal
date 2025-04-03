import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Toggle } from "~/components/ui/toggle";
import { useEditorStore } from "../store";
import {
  Hand,
  MousePointer2,
  Frame,
  Square,
  Type,
  Image as ImgIcon,
  SquarePen,
} from "lucide-react";
import { useRef } from "react";

interface ToolBarProps {
  className: string;
}

export function ToolBar({ className }: ToolBarProps) {
  const tool = useEditorStore((state) => state.tool.type);
  const setTool = useEditorStore((state) => state.setTool);
  const addUploadedImage = useEditorStore((state) => state.addUploadedImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userMode = useEditorStore((state) => state.userMode);
  const toggleUserMode = useEditorStore((state) => state.toggleUserMode);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          addUploadedImage(img);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  return (
    <div className={className}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={tool === "move"}
                onPressedChange={() =>
                  setTool({ type: "move", method: "selected" })
                }
              >
                <MousePointer2 />
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Move - <strong>V</strong>
            </p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={tool === "hand"}
                onPressedChange={() =>
                  setTool({ type: "hand", method: "selected" })
                }
              >
                <Hand />
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Hand tool - <strong>H</strong>
            </p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={userMode === "designer"}
                onPressedChange={() => toggleUserMode()}
              >
                <SquarePen />
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle user mode</p>
          </TooltipContent>
        </Tooltip>
        {userMode === "designer" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Toggle
                  pressed={tool === "frame"}
                  onPressedChange={() =>
                    setTool({ type: "frame", method: "selected" })
                  }
                >
                  <Frame />
                </Toggle>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Frame - <strong>F</strong>
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        {userMode === "designer" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Toggle
                  pressed={tool === "rectangle"}
                  onPressedChange={() =>
                    setTool({ type: "rectangle", method: "selected" })
                  }
                >
                  <Square />
                </Toggle>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Rectangle - <strong>R</strong>
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        {userMode === "designer" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Toggle
                  pressed={tool === "image"}
                  onPressedChange={() => {
                    setTool({ type: "image", method: "selected" });
                    fileInputRef.current?.click();
                  }}
                >
                  <ImgIcon />
                </Toggle>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Image - <strong>I</strong>
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        {userMode === "designer" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Toggle
                  pressed={tool === "text"}
                  onPressedChange={() =>
                    setTool({ type: "text", method: "selected" })
                  }
                >
                  <Type />
                </Toggle>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Text - <strong>T</strong>
              </p>
            </TooltipContent>
          </Tooltip>
        )}
        {userMode === "designer" && (
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        )}
      </TooltipProvider>
    </div>
  );
}
