"use client";

import { useEffect, useState } from "react";
import { Stage } from "react-konva";
import { Frame } from "./_components/frame";
import { EditorUI } from "./_components/editor_ui";
import type { KonvaEventObject } from "konva/lib/Node";

type ToolState = {
  type: "move" | "hand";
  method: "selected" | "toggle";
};

const initialFrames = [
  {
    id: "frame-0",
    name: "Frame 0",
    width: 100,
    height: 300,
    x: 0,
    y: 0,
  },
  {
    id: "frame-1",
    name: "Frame 1",
    width: 100,
    height: 300,
    x: 0,
    y: 0,
  },
];

export default function EditorPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedId, selectObject] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolState>({
    type: "move",
    method: "selected",
  });
  const [mouseButton, setMouseButton] = useState<number | null>(null);

  // Deselect any obect when clicked on empty area(stage)
  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectObject(null);
    }
  };

  // Set stage dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Math.floor(window.innerWidth),
        height: Math.floor(window.innerHeight),
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Space":
          if (tool.type === "move") {
            setTool({ type: "hand", method: "toggle" });
          }
          break;
        case "KeyV":
          setTool({ type: "move", method: "selected" });
          break;
        case "KeyH":
          setTool({ type: "hand", method: "selected" });
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        tool.type === "hand" &&
        tool.method === "toggle" &&
        mouseButton === null
      ) {
        setTool({ type: "move", method: "selected" });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setMouseButton(e.button); // 0: left button, 1: middle button, 2: right button
      if (e.button !== 0 && e.button !== 2) {
        //TODO: fix onmousedown for other buttons
        setTool({ type: "hand", method: "toggle" });
      }
    };

    const handleMouseUp = () => {
      setMouseButton(null);
      if (tool.type === "hand" && tool.method === "toggle") {
        setTool({ type: "move", method: "selected" });
      }
    };

    updateDimensions(); // Set initial dimensions
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [tool, mouseButton]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return null; // Render nothing until dimensions are set
  }

  return (
    <div className="relative h-full w-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable={tool.type === "hand"}
        className="bg-[#1A1A1A]"
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        v
        style={{ cursor: tool.type === "hand" ? "grab" : "default" }}
      >
        {initialFrames.map((frameData, i) => {
          return (
            <Frame
              data={frameData}
              key={i}
              onSelect={() => {
                if (tool.type === "move") selectObject(frameData.id);
              }}
              isSelected={selectedId === frameData.id}
              draggable={tool.type === "move"}
            />
          );
        })}
      </Stage>
      <EditorUI
        tool={tool.type}
        selectTool={(e) => setTool({ type: e, method: "selected" })}
      />
    </div>
  );
}
