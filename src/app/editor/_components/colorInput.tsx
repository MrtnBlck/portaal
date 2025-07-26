"use client";

import { Input } from "~/components/ui/input";
import { HexAlphaColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import type { RGBColor } from "../_utils/editorTypes";
import { TinyColor } from "@ctrl/tinycolor";
import { cn } from "~/lib/utils";
import { useFrameStore } from "../_utils/frameStore";

type ColorInputProps = {
  fill: RGBColor;
  fillOpacity: number;
  id: string;
  frameId?: string;
};

type ColorOpacityInputProps = Omit<ColorInputProps, "fill">;

export function ColorInput({
  fill,
  fillOpacity,
  id,
  frameId,
}: ColorInputProps) {
  const setFillColor = useFrameStore((state) => state.setFillColor);
  const currentColor = useMemo(() => {
    const { R, G, B } = fill;
    return new TinyColor({
      r: R,
      g: G,
      b: B,
      a: fillOpacity / 100,
    });
  }, [fill, fillOpacity]);
  const [inputValue, setInputValue] = useState(currentColor.toHex());
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(currentColor.toHex());
  }, [currentColor]);

  const handleOnBlur = () => {
    const newColor = new TinyColor(inputValue);
    if (isValid) {
      const { r, g, b, a } = newColor.toRgb();
      setFillColor({
        id: id,
        frameId: frameId,
        color: {
          R: r,
          G: g,
          B: b,
        },
        opacity:
          newColor.format === "hex4" || newColor.format === "hex8"
            ? Math.round(a * 100)
            : fillOpacity,
      });
      setInputValue(newColor.toHex());
    } else {
      setInputValue(currentColor.toHex());
    }
    setIsValid(true);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsValid(new TinyColor(value).isValid);
    setInputValue(value);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleOnBlur();
    }
  };

  return (
    <div className="group flex w-full items-center gap-2 rounded-md border border-neutral-700/50 bg-white/5 px-2.5 pl-2 text-xs">
      <Popover>
        <PopoverTrigger
          className="w-fit border-none focus-visible:ring-0"
          asChild
        >
          <Button
            className="rounded-xs size-3.5"
            variant={"none"}
            style={{ backgroundColor: currentColor.toHexString() }}
            size="none"
          />
        </PopoverTrigger>
        <PopoverContent className="customPopup w-fit p-3" sideOffset={5}>
          <HexAlphaColorPicker
            color={currentColor.toHex8String()}
            onChange={(e) => {
              const newColor = new TinyColor(e);
              const { r, g, b, a } = newColor.toRgb();
              setFillColor({
                id: id,
                frameId: frameId,
                color: {
                  R: r,
                  G: g,
                  B: b,
                },
                opacity: Math.round(a * 100),
              });
              setInputValue(newColor.toHex());
            }}
          />
        </PopoverContent>
      </Popover>
      <Input
        className={cn(
          "h-7 flex-1 rounded-none border-none pl-0 !text-xs focus-visible:ring-0",
          isValid ? "" : "text-white/40",
        )}
        value={inputValue}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
      ></Input>
    </div>
  );
}

export function ColorOpacityInput({
  fillOpacity,
  id,
  frameId,
}: ColorOpacityInputProps) {
  const setFillColor = useFrameStore((state) => state.setFillColor);
  const formattedOpacity = `${fillOpacity}%`;
  const [inputValue, setInputValue] = useState(formattedOpacity);

  useEffect(() => {
    setInputValue(formattedOpacity);
  }, [formattedOpacity]);

  const handleOnBlur = () => {
    let value = inputValue;
    if (value.includes("%")) {
      value = value.replace("%", "");
    }
    if (value !== "") {
      const newValue = Math.min(Math.max(parseInt(value), 0), 100);
      setFillColor({
        id: id,
        frameId: frameId,
        opacity: newValue,
      });
      setInputValue(`${newValue}%`);
    } else {
      setInputValue(formattedOpacity);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^(?:\d*\.?\d*%?)$/;
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
    <div className="group flex w-16 items-center rounded-md border border-neutral-700/50 bg-white/5">
      <Input
        className="h-7 w-full rounded-none border-none px-1 text-center !text-xs focus-visible:ring-0"
        value={inputValue}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
      ></Input>
    </div>
  );
}
