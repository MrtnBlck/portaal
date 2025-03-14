import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import { Toggle } from "~/components/ui/toggle";
import { useEditorStore } from "../store";
import { Hand, MousePointer2, Frame, Square, Circle, Type } from "lucide-react";

interface ToolBarProps {
  className: string;
}

export function ToolBar({ className }: ToolBarProps) {
  const tool = useEditorStore((state) => state.tool.type);
  const setTool = useEditorStore((state) => state.setTool);

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
                pressed={tool === "wip"}
                onPressedChange={() =>
                  setTool({ type: "wip", method: "selected" })
                }
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
                onPressedChange={() =>
                  setTool({ type: "wip", method: "selected" })
                }
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
