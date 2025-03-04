"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage } from "react-konva";
import { Frame } from "./_components/frame";
import { MenuWrapper } from "./_components/menuWrapper";
import { EditorUI } from "./_components/editorUI";
import type { KonvaEventObject } from "konva/lib/Node";
import { v4 as uuidv4 } from "uuid";

type ToolState = {
  type: "move" | "hand" | "frame";
  method: "selected" | "toggle";
};

type DrawingPositions = {
  x: number;
  y: number;
};

type ObjectType = "Frame" | "Image" | "Text" | "Shape" | "Group";

export interface ObjectData {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  type: ObjectType;
}

const initialFrames = [
  {
    id: uuidv4(),
    name: "Frame 0",
    width: 100,
    height: 300,
    x: 300,
    y: 300,
    type: "Frame" as ObjectType,
  },
];

export default function EditorPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);
  const [tool, setTool] = useState<ToolState>({
    type: "move",
    method: "selected",
  });
  const [mouseButton, setMouseButton] = useState<number | null>(null);

  // Frame drawing states
  const [frames, setFrames] = useState<ObjectData[]>(initialFrames);
  const isDrawing = useRef(false);
  const drawingPositions = useRef<DrawingPositions>({ x: 0, y: 0 });

  // Zoom states
  const [stageScale, setStageScale] = useState(1);

  // Context menu enable/disable
  // const [isContextMenuDisabled, setContextMenuDisabled] = useState(false);

  const handleStageOnMouseDown = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    //handleContextMenuClosing();
    switch (tool.type) {
      case "move":
        checkDeselect(e);
        break;
      case "frame":
        setSelectedObject(null);
        const stage = e.target.getStage();
        if (stage) {
          const pos = stage.getRelativePointerPosition();
          if (pos) {
            isDrawing.current = true;
            drawingPositions.current = {
              x: pos.x,
              y: pos.y,
            };
            const newFrame: ObjectData = {
              id: uuidv4(),
              name: `Frame ${frames.length}`,
              width: 20,
              height: 20,
              x: pos.x,
              y: pos.y,
              type: "Frame" as ObjectType,
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
            newFrame.x = Math.round(Math.min(x1, x2));
            newFrame.y = Math.round(Math.min(y1, y2));
            newFrame.width = Math.round(Math.abs(x2 - x1));
            newFrame.height = Math.round(Math.abs(y2 - y1));
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
        setSelectedObject(newFrame);
      }
    }
  };

  // Deselect any obect when clicked on empty area(stage)
  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedObject(null);
    }
  };

  const zoomStage = (e: KonvaEventObject<WheelEvent>, scale: number) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    // scaleBy: 1.1
    const newScale = Math.min(
      Math.max(
        Math.floor(
          (e.evt.deltaY < 0 ? oldScale * scale : oldScale / scale) * 100,
        ) / 100,
        0.1,
      ),
      9.99,
    );
    stage.scale({ x: newScale, y: newScale });
    setStageScale(newScale);
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  function onScroll(e: KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    if (e.evt.ctrlKey) {
      zoomStage(e, 1.1);
    }
  }

  const deleteSelectedObject = useCallback(() => {
    if (selectedObject) {
      switch (selectedObject.type) {
        case "Frame":
          setFrames(frames.filter((frame) => frame.id !== selectedObject.id));
          break;
        case "Image":
          break;
        case "Text":
          break;
        case "Shape":
          break;
        case "Group":
          break;
        default:
          break;
      }
      setSelectedObject(null);
    }
  }, [selectedObject, frames]);

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
        case "Delete":
          deleteSelectedObject();
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

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    updateDimensions(); // Set initial dimensions
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [tool, mouseButton, frames, selectedObject, deleteSelectedObject]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return null; // Render nothing until dimensions are set
  }

  // Function to update only one specific frame from the frames array
  const updateFrame = (frame: ObjectData) => {
    const currentFrameIndex = frames.findIndex((f) => f.id === frame.id);
    const framesBeforeCurrentFrame = frames.slice(0, currentFrameIndex);
    const framesAfterCurrentFrame = frames.slice(currentFrameIndex + 1);
    const newFrames = [
      ...framesBeforeCurrentFrame,
      frame,
      ...framesAfterCurrentFrame,
    ];
    setFrames(newFrames);
  };

  return (
    <MenuWrapper
      selectedObject={selectedObject}
      deleteObject={deleteSelectedObject}
    >
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
          onWheel={onScroll}
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
          scale={{ x: stageScale, y: stageScale }}
        >
          {frames.map((frame) => {
            return (
              <Frame
                frame={frame}
                key={frame.id}
                setSelectedObject={() => {
                  if (tool.type === "move") setSelectedObject(frame);
                }}
                isSelected={selectedObject?.id === frame.id}
                draggable={tool.type === "move"}
                stageScale={stageScale}
                updateFrame={(e: ObjectData) => updateFrame(e)}
              />
            );
          })}
        </Stage>
        <EditorUI
          tool={tool.type}
          setTool={(tool) => setTool({ type: tool, method: "selected" })}
          stageScale={stageScale}
          setStageScale={(scale) => setStageScale(scale)}
          frames={frames}
          selectedObject={selectedObject}
          setSelectedObject={(e) => setSelectedObject(e)}
          updateFrame={(e: ObjectData) => updateFrame(e)}
        />
      </div>
    </MenuWrapper>
  );
}
