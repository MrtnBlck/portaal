"use client";

import { useEffect, useRef, useState } from "react";
import { Stage } from "react-konva";
import { Frame } from "./_components/frame";
import { EditorUI } from "./_components/editor_ui";
import type { KonvaEventObject } from "konva/lib/Node";

type ToolState = {
  type: "move" | "hand" | "frame";
  method: "selected" | "toggle";
};

type DrawingPositions = {
  x: number;
  y: number;
};

const initialFrames = [
  {
    id: "frame-0",
    name: "Frame 0",
    width: 100,
    height: 300,
    x: 300,
    y: 300,
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

  // Frame drawing states
  const [frames, setFrames] = useState(initialFrames);
  const isDrawing = useRef(false);
  const drawingPositions = useRef<DrawingPositions>({ x: 0, y: 0 });

  const handleStageOnMouseDown = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    switch (tool.type) {
      case "move":
        checkDeselect(e);
        break;
      case "frame":
        selectObject(null);
        console.log("frame tool started drawing");
        const stage = e.target.getStage();
        if (stage) {
          const pos = stage.getRelativePointerPosition();
          if (pos) {
            isDrawing.current = true;
            drawingPositions.current = {
              x: pos.x,
              y: pos.y,
            };
            const newFrame = {
              id: `frame-${frames.length}`,
              name: `Frame ${frames.length}`,
              width: 0,
              height: 0,
              x: pos.x,
              y: pos.y,
            };
            setFrames([...frames, newFrame]);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleStageOnMouseMove = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    if (tool.type === "frame" && isDrawing.current) {
      console.log("frame tool drawing");
      const stage = e.target.getStage();
      if (stage) {
        const pos = stage.getRelativePointerPosition();
        if (pos) {
          const newFrames = [...frames];
          const newFrame = newFrames[newFrames.length - 1];
          if (newFrame) {
            const x1 = drawingPositions.current.x;
            const y1 = drawingPositions.current.y;
            const x2 = pos.x;
            const y2 = pos.y;
            newFrame.x = Math.min(x1, x2);
            newFrame.y = Math.min(y1, y2);
            newFrame.width = Math.abs(x2 - x1);
            newFrame.height = Math.abs(y2 - y1);
            setFrames(newFrames);
          }
        }
      }
    }
  };

  const handleStageOnMouseUp = () => {
    if (tool.type === "frame" && isDrawing.current) {
      isDrawing.current = false;
      const newFrames = [...frames];
      const newFrame = newFrames[newFrames.length - 1];
      if (newFrame) {
        selectObject(newFrame.id);
      }
    }
  };

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
          if (tool.type !== "hand") {
            setTool({ type: "hand", method: "toggle" });
          }
          break;
        case "KeyV":
          setTool({ type: "move", method: "selected" });
          break;
        case "KeyH":
          setTool({ type: "hand", method: "selected" });
          break;
        case "KeyF":
          setTool({ type: "frame", method: "selected" });
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
        // TODO: Add check for previous tool
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
      if (
        (tool.type === "hand" && tool.method === "toggle") ||
        tool.type === "frame"
      ) {
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
        onMouseDown={handleStageOnMouseDown}
        onTouchStart={handleStageOnMouseDown}
        onMouseMove={handleStageOnMouseMove}
        onTouchMove={handleStageOnMouseMove}
        onMouseUp={handleStageOnMouseUp}
        onTouchEnd={handleStageOnMouseUp}
        style={{
          cursor:
            tool.type === "hand"
              ? "grab"
              : tool.type === "move"
                ? "default"
                : "crosshair",
        }}
      >
        {frames.map((frameData, i) => {
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
