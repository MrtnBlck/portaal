import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Toggle } from "~/components/ui/toggle";

interface ToolBarProps {
  tool: "move" | "hand" | "frame";
  setTool: (tool: "move" | "hand" | "frame") => void;
  className?: string;
}

import { Hand, MousePointer2, Frame } from "lucide-react";

export function ToolBar({ tool, setTool, className }: ToolBarProps) {
  return (
    <div className={className}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={tool === "move"}
                onPressedChange={() => setTool("move")}
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
                onPressedChange={() => setTool("hand")}
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
                pressed={tool === "frame"}
                onPressedChange={() => setTool("frame")}
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
      </TooltipProvider>
    </div>
  );
}
