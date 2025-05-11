"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Toggle } from "~/components/ui/toggle";
import { useEditorStore } from "../_utils/editorStore";
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

export function ToolBar({ className }: { className: string }) {
  const tool = useEditorStore((state) => state.tool.type);
  const setTool = useEditorStore((state) => state.setTool);
  const addNewImageData = useEditorStore((state) => state.addNewImageData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userMode = useEditorStore((state) => state.userMode);
  const toggleUserMode = useEditorStore((state) => state.toggleUserMode);
  const setNewImageFile = useEditorStore((state) => state.setNewImageFile);
  const isTemplateOwner = useEditorStore((state) => state.isTemplateOwner);
  const isEditable = useEditorStore((state) => state.isEditable);

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
          addNewImageData({
            imageURL: img.src,
            imageWidth: img.width,
            imageHeight: img.height,
            imageKey: "",
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      setNewImageFile(file);
    }
    e.target.value = "";
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
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
        {(isEditable || isTemplateOwner) && (
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
        )}
        {userMode === "designer" && (
          <>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Toggle
                    pressed={tool === "image"}
                    onPressedChange={() => {
                      setTool({ type: "image", method: "selected" });
                      openFileInput();
                    }}
                  >
                    <ImgIcon />
                  </Toggle>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Image{/*  - <strong>I</strong> */}</p>
              </TooltipContent>
            </Tooltip>
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
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </>
        )}
      </TooltipProvider>
    </div>
  );
}
