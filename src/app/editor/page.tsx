"use client";

import { useEffect, useState } from "react";
import { Stage } from "react-konva";
import { Frame } from "./_components/frame";
import { MenuWrapper } from "./_components/menuWrapper";
import { EditorUI } from "./_components/editorUI";
import { useFrameStore, useEditorStore } from "./store";
import { useStageUtils } from "./_utils/useStageUtils";
import { EventListener } from "./_utils/eventListener";

export type ToolState = {
  type: "move" | "hand" | "frame" | "rectangle" | "text" | "image" | "wip";
  method: "selected" | "toggle";
};

export type ObjectType = "Frame" | "Image" | "Text" | "Rectangle" | "Group";

export interface Link {
  parentID: string;
  elementID: string;
}

export interface LinkData {
  linkRole: "parent" | "child";
  linkedTo: Link | null;
  linkedElements: Link[] | null;
}

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
  textValue?: string;
  beingDrawn?: boolean;
  beingEdited?: boolean;
  image?: HTMLImageElement | null;
  links?: LinkData;
}

export default function EditorPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Frame store
  const frameIDs = useFrameStore((state) => state.getFrameIDs);

  // Edtior store
  const storeTool = useEditorStore((state) => state.tool);
  const storeStageScale = useEditorStore((state) => state.stageScale);

  const {
    handleStageOnMouseDown,
    handleStageOnMouseMove,
    handleStageOnMouseUp,
    deleteSelectedObject,
    onScroll,
  } = useStageUtils();

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
    <MenuWrapper deleteObject={deleteSelectedObject}>
      <div className="relative h-full w-full">
        <EventListener />
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
          {frameIDs().map((ID) => {
            return <Frame ID={ID} key={ID} />;
          })}
        </Stage>
      </div>
      <EditorUI />
    </MenuWrapper>
  );
}
