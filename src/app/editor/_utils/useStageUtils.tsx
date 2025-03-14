

import type { KonvaEventObject } from "konva/lib/Node";
import { useFrameStore, useEditorStore } from "../store";
import { useRef, useCallback } from "react";
import type { ObjectData, ObjectType } from "../page";
import { v4 as uuidv4 } from "uuid";

type DrawingPositions = {
  x: number;
  y: number;
};

export const useStageUtils = () => {
  const storeTool = useEditorStore((state) => state.tool);
  const storeSelectedObject = useEditorStore((state) => state.selectedObject);
  const setStoreSelectedObject = useEditorStore(
    (state) => state.setSelectedObject,
  );
  const storeFrames = useFrameStore((state) => state.frames);
  const deleteStoreFrame = useFrameStore((state) => state.deleteFrame);
  const addStoreFrame = useFrameStore((state) => state.addFrame);
  const updateStoreFrame = useFrameStore((state) => state.updateFrame);
  const setStoreStageScale = useEditorStore((state) => state.setStageScale);

  const isDrawing = useRef(false);
  const drawingPositions = useRef<DrawingPositions>({ x: 0, y: 0 });

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setStoreSelectedObject(null);
    }
  };

  const handleStageOnMouseDown = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
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

  const onScroll = (e: KonvaEventObject<WheelEvent>) => {
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
    }
  }, [storeSelectedObject, deleteStoreFrame]);

  return {
    handleStageOnMouseDown,
    handleStageOnMouseMove,
    handleStageOnMouseUp,
    checkDeselect,
    zoomStage,
    onScroll,
    deleteSelectedObject,
  };
};
