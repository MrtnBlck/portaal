import type { KonvaEventObject } from "konva/lib/Node";
import { useFrameStore, useEditorStore } from "../store";
import { useRef, useCallback } from "react";
import type { ObjectData, ObjectType } from "../page";
import { v4 as uuidv4 } from "uuid";
import type Konva from "konva";

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
  const getFrame = useFrameStore((state) => state.getFrame);
  const addElement = useFrameStore((state) => state.addElement);
  const currentDrawingElement = useRef<ObjectData | null>(null);
  const updateElement = useFrameStore((state) => state.updateElement);
  const deleteElement = useFrameStore((state) => state.deleteElement);

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
    if (storeTool.type === "move") {
      checkDeselect(e);
      return;
    }
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    drawingPositions.current = {
      x: pos.x,
      y: pos.y,
    };

    if (storeTool.type === "frame") {
      setStoreSelectedObject(null);
      const newFrame: ObjectData = {
        id: uuidv4(),
        name: `Frame ${storeFrames.length}`,
        width: 20,
        height: 20,
        x: pos.x,
        y: pos.y,
        type: "Frame" as ObjectType,
        elements: [] as ObjectData[],
        beingDrawn: true,
      };
      addStoreFrame(newFrame);
      currentDrawingElement.current = newFrame;
      return;
    }
    const targetAttrs = e.target.attrs as Konva.NodeConfig;
    if (!targetAttrs) return;
    const frameID = targetAttrs.id!;
    if (!frameID) return;
    const frame = getFrame(frameID);
    if (!frame) return;
    drawingPositions.current = {
      x: pos.x - frame.x,
      y: pos.y - frame.y,
    };
    if (storeTool.type === "rectangle") {
      const newRectangle: ObjectData = {
        id: uuidv4(),
        name: frame.elements
          ? `Rectangle ${frame.elements.length}`
          : "Rectangle 0",
        width: 1,
        height: 1,
        x: pos.x - frame.x,
        y: pos.y - frame.y,
        type: "Rectangle" as ObjectType,
        parentID: frame.id,
        beingDrawn: true,
      };
      addElement(frame, newRectangle);
      currentDrawingElement.current = newRectangle;
    }
    if (storeTool.type === "text") {
      const newText: ObjectData = {
        id: uuidv4(),
        name: frame.elements ? `Text ${frame.elements.length}` : "Text 0",
        width: 1,
        height: 1,
        x: pos.x - frame.x,
        y: pos.y - frame.y,
        type: "Text" as ObjectType,
        parentID: frame.id,
        beingDrawn: true,
      };
      addElement(frame, newText);
      currentDrawingElement.current = newText;
    }
  };

  const handleStageOnMouseMove = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;
    const newObject = currentDrawingElement.current;
    if (!newObject || !newObject.beingDrawn) return;
    const frame = getFrame(newObject.parentID ?? "");

    const x1 = drawingPositions.current.x;
    const y1 = drawingPositions.current.y;
    const x2 = pos.x - (frame ? frame.x : 0);
    const y2 = pos.y - (frame ? frame.y : 0);
    newObject.x = Math.round(Math.min(x1, x2));
    newObject.y = Math.round(Math.min(y1, y2));
    newObject.width = Math.round(Math.abs(x2 - x1));
    newObject.height = Math.round(Math.abs(y2 - y1));

    currentDrawingElement.current = newObject;
    if (storeTool.type === "frame") {
      updateStoreFrame(newObject, false);
    } else if (newObject.parentID) {
      updateElement(newObject.parentID, newObject, false);
    }
  };

  const handleStageOnMouseUp = () => {
    const newObject = currentDrawingElement.current;
    if (!newObject || !newObject.beingDrawn) return;
    if (
      storeTool.type !== "frame" &&
      storeTool.type !== "rectangle" &&
      storeTool.type !== "text"
    )
      return;
    if (storeTool.type === "frame") {
      updateStoreFrame({ ...newObject, beingDrawn: false }, false);
    } else if (newObject.parentID) {
      updateElement(
        newObject.parentID,
        { ...newObject, beingDrawn: false },
        false,
      );
    }
    setStoreSelectedObject(newObject);
    currentDrawingElement.current = null;
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
  };

  const deleteSelectedObject = useCallback(() => {
    if (!storeSelectedObject) return;
    if (storeSelectedObject.type === "Frame") {
      deleteStoreFrame(storeSelectedObject.id);
    } else if (storeSelectedObject.parentID) {
      deleteElement(storeSelectedObject.parentID, storeSelectedObject.id);
    }
  }, [storeSelectedObject, deleteStoreFrame, deleteElement]);

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
