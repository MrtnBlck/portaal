"use client";

import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { useEditorStore } from "../_utils/editorStore";
import type { ObjectData } from "../_utils/editorTypes";

interface placeholderInputProps {
  value: string | undefined;
  setValue: (value: string) => void;
  element: ObjectData;
}

export function PlaceholderInput({
  value,
  setValue,
  element,
}: placeholderInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);

  useEffect(() => {
    if (!value) return;
    setInputValue(value.toString());
  }, [value]);

  if (value === undefined || inputValue === undefined) {
    return null;
  }

  const handleOnBlur = () => {
    setValue(inputValue);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleOnBlur();
    }
  };

  return (
    <div className="focus: group flex w-full items-center rounded-md border border-neutral-700/50 bg-white/5 px-2.5 text-xs">
      <Input
        className="h-7 w-full rounded-none border-none pl-0 !text-xs focus-visible:ring-0"
        value={inputValue}
        onBlur={handleOnBlur}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setInputValue(e.target.value)
        }
        onKeyDown={handleOnKeyDown}
        onFocus={() => {
          setSelectedObject(element);
        }}
      ></Input>
    </div>
  );
}
