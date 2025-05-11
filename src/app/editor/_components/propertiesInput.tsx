"use client";

import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";

interface propertiesInputProps {
  name: string;
  value: number;
  setValue: (value: number) => void;
  min?: number;
  max?: number;
}

export function PropertiesInput({name, value, setValue, min, max}: propertiesInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleOnBlur = () => {
    if (inputValue !== "") {
      let newValue;
      if (min !== undefined && max !== undefined) {
        newValue = Math.min(Math.max(parseInt(inputValue), min), max);
      } else {
        newValue = parseInt(inputValue);
      }
      setValue(newValue);
    } else {
      setInputValue(value.toString());
    }
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[0-9]*$/;
    if (regex.test(value)) {
      setInputValue(value);
    }
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleOnBlur();
    }
  };

  return (
    <div className="group flex w-full items-center rounded-md border border-neutral-700/50 bg-white/5 px-2.5 text-xs">
      <span className="pr-2 font-medium text-neutral-400">{name}</span>
      <Input
        className="h-7 w-full rounded-none border-none pl-0 !text-xs focus-visible:ring-0"
        value={inputValue}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
      ></Input>
    </div>
  );
}
