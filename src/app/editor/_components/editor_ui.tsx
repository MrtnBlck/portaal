"use client";

import { Toggle } from "~/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Hand, MousePointer2 } from "lucide-react";

interface EditorUIProps {
  tool: "move" | "hand";
  selectTool: (tool: "move" | "hand") => void;
}

export function EditorUI({ tool, selectTool }: EditorUIProps) {
  return (
    <>
      {/* <div className="absolute inset-y-0 left-0 flex w-64 flex-col gap-2.5 p-2.5">
        <div className="rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          Variants
        </div>
        <div className="flex-1 rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          Layers
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 flex w-64 flex-col gap-2.5 p-2.5">
        <div className="rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          Actions
        </div>
        <div className="flex-1 rounded-md bg-[#1F1F1F] p-2.5 text-white shadow-lg">
          Properties
        </div>
      </div> */}
      <div className="absolute bottom-0 left-1/2 w-full max-w-64 -translate-x-1/2 p-2.5">
        <div className="w-full space-x-1 rounded-lg bg-[#1F1F1F] p-1.5 text-white shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Toggle
                    pressed={tool === "move"}
                    onPressedChange={() => selectTool("move")}
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
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Toggle
                    pressed={tool === "hand"}
                    onPressedChange={() => selectTool("hand")}
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
          </TooltipProvider>
        </div>
      </div>
    </>
  );
}
