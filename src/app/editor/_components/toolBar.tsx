import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Toggle } from "~/components/ui/toggle";

interface ToolBarProps {
  tool: "move" | "hand" | "frame" | "wip";
  setTool: (tool: "move" | "hand" | "frame") => void;
  className?: string;
}

import { Hand, MousePointer2, Frame, Square, Circle, Type } from "lucide-react";

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
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={tool === "wip"}
                onPressedChange={() => setTool("move")}
                disabled
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
                pressed={tool === "wip"}
                onPressedChange={() => setTool("move")}
                disabled
              >
                <Circle />
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Circle - <strong>C</strong>
            </p>
          </TooltipContent>
        </Tooltip>
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={tool === "wip"}
                onPressedChange={() => setTool("move")}
                disabled
              >
                <Image />
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Image - <strong>I</strong>
            </p>
          </TooltipContent>
        </Tooltip> */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Toggle
                pressed={tool === "wip"}
                onPressedChange={() => setTool("move")}
                disabled
              >
                <Type />
              </Toggle>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Image - <strong>I</strong>
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
