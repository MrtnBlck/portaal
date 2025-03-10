"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Stage } from "react-konva";
import { Frame } from "./_components/frame";
import { MenuWrapper } from "./_components/menuWrapper";
import { EditorUI } from "./_components/editorUI";
import type { KonvaEventObject } from "konva/lib/Node";
import { v4 as uuidv4 } from "uuid";
import { useFrameStore, useEditorStore } from "./store";

export type ToolState = {
  type: "move" | "hand" | "frame" | "rectangle" | "wip";
  method: "selected" | "toggle";
};

type DrawingPositions = {
  x: number;
  y: number;
};

export type ObjectType = "Frame" | "Image" | "Text" | "Rectangle" | "Group";

export interface ObjectData {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  type: ObjectType;
  elements?: ObjectData[];
  parentID?: string;
}

export default function EditorPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // TODO: change to useRef
  const [mouseButton, setMouseButton] = useState<number | null>(null);

  // Frame drawing states
  const isDrawing = useRef(false);
  const drawingPositions = useRef<DrawingPositions>({ x: 0, y: 0 });

  // Frame store
  const storeFrames = useFrameStore((state) => state.frames);
  const addStoreFrame = useFrameStore((state) => state.addFrame);
  const updateStoreFrame = useFrameStore((state) => state.updateFrame);
  const deleteStoreFrame = useFrameStore((state) => state.deleteFrame);

  // Edtior store
  const storeSelectedObject = useEditorStore((state) => state.selectedObject);
  const setStoreSelectedObject = useEditorStore(
    (state) => state.setSelectedObject,
  );
  const storeTool = useEditorStore((state) => state.tool);
  const setStoreTool = useEditorStore((state) => state.setTool);
  const storeStageScale = useEditorStore((state) => state.stageScale);
  const setStoreStageScale = useEditorStore((state) => state.setStageScale);

  const handleStageOnMouseDown = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    //handleContextMenuClosing();
    switch (storeTool.type) {
      case "move":
        checkDeselect(e);
        break;
      case "frame":
        setStoreSelectedObject(null);
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
              name: `Frame ${storeFrames.length}`,
              width: 20,
              height: 20,
              x: pos.x,
              y: pos.y,
              type: "Frame" as ObjectType,
              elements: [] as ObjectData[],
            };
            addStoreFrame(newFrame);
          }
        }
        break;
      case "rectangle":
        /* setStoreSelectedObject(null);
        const stageRect = e.target.getStage();
        if (stageRect) {
          const layer = stageRect.findOne("#myLayer") as Konva.Layer;
          const pos = stageRect.getRelativePointerPosition();
          if (pos && layer) {
            isDrawing.current = true;
            drawingPositions.current = {
              x: pos.x,
              y: pos.y,
            };
            const newRectangle = new Konva.Rect({
              width: 20,
              height: 20,
              x: pos.x,
              y: pos.y,
              fill: "#FFFFFF",
              id: "myRect",
            });
            layer.add(newRectangle);
          }
        } */
        break;
      default:
        break;
    }
  };

  const handleStageOnMouseMove = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    if (storeTool.type === "frame" && isDrawing.current) {
      const stage = e.target.getStage();
      if (stage) {
        const pos = stage.getRelativePointerPosition();
        if (pos) {
          const newFrame = storeFrames[storeFrames.length - 1];
          if (newFrame) {
            const x1 = drawingPositions.current.x;
            const y1 = drawingPositions.current.y;
            const x2 = pos.x;
            const y2 = pos.y;
            newFrame.x = Math.round(Math.min(x1, x2));
            newFrame.y = Math.round(Math.min(y1, y2));
            newFrame.width = Math.round(Math.abs(x2 - x1));
            newFrame.height = Math.round(Math.abs(y2 - y1));
            updateStoreFrame(newFrame);
          }
        }
      }
    } else if (storeTool.type === "rectangle" && isDrawing.current) {
      /* const stageRect = e.target.getStage();
      if (stageRect) {
        const layer = stageRect.findOne("#myLayer") as Konva.Layer;
        const pos = stageRect.getRelativePointerPosition();
        if (pos && layer) {
          const newRectangle = layer.findOne("#myRect") as Konva.Rect;
          if (newRectangle) {
            const x1 = drawingPositions.current.x;
            const y1 = drawingPositions.current.y;
            const x2 = pos.x;
            const y2 = pos.y;
            newRectangle.x(Math.round(Math.min(x1, x2)));
            newRectangle.y(Math.round(Math.min(y1, y2)));
            newRectangle.width(Math.round(Math.abs(x2 - x1)));
            newRectangle.height(Math.round(Math.abs(y2 - y1)));
            layer.batchDraw();
          }
        }
      } */
    }
  };

  const handleStageOnMouseUp = () => {
    if (storeTool.type === "frame" && isDrawing.current) {
      isDrawing.current = false;
      const newFrame = storeFrames[storeFrames.length - 1];
      if (newFrame) {
        setStoreSelectedObject(newFrame);
      }
    } else if (storeTool.type === "rectangle" && isDrawing.current) {
      /* isDrawing.current = false; */
    }
  };

  // Deselect any obect when clicked on empty area(stage)
  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setStoreSelectedObject(null);
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
    setStoreStageScale(newScale);
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
    if (storeSelectedObject) {
      switch (storeSelectedObject.type) {
        case "Frame":
          deleteStoreFrame(storeSelectedObject.id);
          break;
        case "Image":
          break;
        case "Text":
          break;
        case "Rectangle":
          break;
        case "Group":
          break;
        default:
          break;
      }
      setStoreSelectedObject(null);
    }
  }, [storeSelectedObject, deleteStoreFrame, setStoreSelectedObject]);

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
          if (storeTool.type !== "hand") {
            setStoreTool({ type: "hand", method: "toggle" });
          }
          break;
        case "KeyV":
          setStoreTool({ type: "move", method: "selected" });
          break;
        case "KeyH":
          setStoreTool({ type: "hand", method: "selected" });
          break;
        case "KeyF":
          setStoreTool({ type: "frame", method: "selected" });
          break;
        case "KeyR":
          setStoreTool({ type: "rectangle", method: "selected" });
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
        storeTool.type === "hand" &&
        storeTool.method === "toggle" &&
        mouseButton === null
      ) {
        // TODO: Add check for previous tool
        setStoreTool({ type: "move", method: "selected" });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setMouseButton(e.button); // 0: left button, 1: middle button, 2: right button
      if (e.button !== 0 && e.button !== 2) {
        //TODO: fix onmousedown for other buttons
        setStoreTool({ type: "hand", method: "toggle" });
      }
    };

    const handleMouseUp = () => {
      setMouseButton(null);
      if (
        (storeTool.type === "hand" && storeTool.method === "toggle") ||
        storeTool.type === "frame"
      ) {
        setStoreTool({ type: "move", method: "selected" });
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
  }, [
    storeTool,
    mouseButton,
    storeSelectedObject,
    setStoreTool,
    deleteSelectedObject,
  ]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return null; // Render nothing until dimensions are set
  }

  return (
    <MenuWrapper deleteObject={deleteSelectedObject}>
      <div className="relative h-full w-full">
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          draggable={storeTool.type === "hand"}
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
              storeTool.type === "hand"
                ? "grab"
                : storeTool.type === "move"
                  ? "default"
                  : "crosshair",
          }}
          scale={{ x: storeStageScale, y: storeStageScale }}
        >
          {storeFrames.map((frame) => {
            return <Frame frame={frame} key={frame.id} />;
          })}
        </Stage>
        <EditorUI />
      </div>
    </MenuWrapper>
  );
}
