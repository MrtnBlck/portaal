"use client";

import { useEffect, useState } from "react";
import { Stage } from "react-konva";
import { Frame } from "./_components/frame";
import { EditorUI } from "./_components/editor_ui";
import { KonvaEventObject } from "konva/lib/Node";

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
  const [tool, setTool] = useState<"move" | "hand">("move");

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

    updateDimensions(); // Set initial dimensions
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return null; // Render nothing until dimensions are set
  }

  return (
    <div className="relative h-full w-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable={tool === "hand"}
        className="bg-[#1A1A1A]"
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        {initialFrames.map((frameData, i) => {
          return (
            <Frame
              data={frameData}
              key={i}
              onSelect={tool === "move" ? () => selectObject(frameData.id) : () => {}}
              isSelected={selectedId === frameData.id}
              draggable={tool === "move"}
            />
          );
        })}
      </Stage>
      <EditorUI tool={tool} selectTool={(e) => setTool(e)}/>
    </div>
  );
}
