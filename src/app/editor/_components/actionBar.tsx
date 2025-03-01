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

interface ActionBarProps {
  stageScale: number;
  setStageScale: (scale: number) => void;
}

export function ActionBar({ stageScale, setStageScale }: ActionBarProps) {
  const [stageScaleInput, setStageScaleInput] = useState("100%");

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
      setStageScaleInput(`${Math.round(stageScale * 100)}%`)
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[0-9%]*$/;
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
    <div className="flex items-center justify-between rounded-lg bg-[#1F1F1F] p-1.5 pl-2 text-white shadow-[0px_0px_5px_4px_rgba(0,_0,_0,_0.1)]">
      <Input className="w-min-0 h-7 w-16 bg-[#282828] text-center" value={stageScaleInput} onBlur={handleOnBlur} onChange={handleOnChange} onKeyDown={handleOnKeyDown}/>
      <div className="flex gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  size="icon"
                  className="h-8 w-8 bg-[#5952BB] text-white"
                  disabled
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
                  className="h-8 w-8 bg-[#528FBB] text-white"
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
                  className="h-8 w-8 bg-[#52BB86] text-white"
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
      </div>
    </div>
  );
}
