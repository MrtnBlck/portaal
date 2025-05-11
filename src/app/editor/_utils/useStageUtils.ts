import type { KonvaEventObject } from "konva/lib/Node";
import { useEditorStore } from "./editorStore";
import { useFrameStore } from "./frameStore";
import { useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type Konva from "konva";
import type {
  FrameData,
  FrameElementData,
  ObjectData,
  ObjectType,
  PictureData,
  TextData,
} from "./editorTypes";
import { useUploadThing } from "~/utils/uploadthing";
import { deleteUTFiles } from "~/server/api/utapi";

export const useStageUtils = () => {
  const tool = useEditorStore((state) => state.tool);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const frames = useFrameStore((state) => state.frames);
  const deleteFrame = useFrameStore((state) => state.deleteFrame);
  const addFrame = useFrameStore((state) => state.addFrame);
  const updateFrame = useFrameStore((state) => state.updateFrame);
  const setStageScale = useEditorStore((state) => state.setStageScale);
  const getFrame = useFrameStore((state) => state.getFrame);
  const addElement = useFrameStore((state) => state.addElement);
  const currentDrawingElement = useRef<ObjectData | null>(null);
  const updateElement = useFrameStore((state) => state.updateElement);
  const deleteElement = useFrameStore((state) => state.deleteElement);
  const toggleTextEditing = useFrameStore((state) => state.toggleTextEditing);
  const newImageData = useEditorStore((state) => state.newImageData);
  const updateImageProps = useFrameStore((state) => state.updateImageProps);
  const removeNewImageData = useEditorStore(
    (state) => state.removeNewImageData,
  );
  const removeNewImageObject = useEditorStore(
    (state) => state.removeNewImageObject,
  );
  const setNewImageObject = useEditorStore((state) => state.setNewImageObject);
  const newImageObject = useEditorStore((state) => state.newImageObject);
  const newImageFile = useEditorStore((state) => state.newImageFile);
  const moveFrameToTop = useFrameStore((state) => state.moveFrameToTop);
  const moveFrameToBottom = useFrameStore((state) => state.moveFrameToBottom);
  const moveElementToTop = useFrameStore((state) => state.moveElementToTop);
  const moveElementToBottom = useFrameStore(
    (state) => state.moveElementToBottom,
  );

  const drawingPositions = useRef<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      const sElement = selectedObject as TextData;
      if (sElement && sElement.beingEdited) {
        toggleTextEditing(sElement.frameID, sElement.ID, false);
        return;
      }
      setSelectedObject(null);
    }
  };

  const handleStageOnMouseDown = (
    e: KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    if (tool.type === "move") {
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

    if (tool.type === "frame") {
      setSelectedObject(null);
      const newFrame: FrameData = {
        ID: uuidv4(),
        name: `Frame ${frames.length}`,
        width: 20,
        height: 20,
        x: pos.x,
        y: pos.y,
        type: "Frame" as ObjectType,
        elements: [] as FrameElementData[],
        fill: {
          R: 255,
          G: 255,
          B: 255,
        },
        fillOpacity: 100,
        selectedForExport: true,
      };
      addFrame(newFrame);
      currentDrawingElement.current = newFrame;
      return;
    }
    const targetAttrs = e.target.attrs as Konva.NodeConfig;
    if (!targetAttrs) return;
    const frameID = (
      targetAttrs.frameID === undefined ? targetAttrs.id : targetAttrs.frameID
    ) as string;
    if (!frameID) return;
    const frame = getFrame(frameID);
    if (!frame) {
      if (tool.type === "image") {
        removeNewImageData();
      }
      return;
    }
    drawingPositions.current = {
      x: pos.x - frame.x,
      y: pos.y - frame.y,
    };
    if (tool.type === "rectangle") {
      const newRectangle: FrameElementData = {
        ID: uuidv4(),
        frameID: frame.ID,
        name: frame.elements
          ? `Rectangle ${frame.elements.length}`
          : "Rectangle 0",
        width: 1,
        height: 1,
        x: pos.x - frame.x,
        y: pos.y - frame.y,
        type: "Rectangle" as ObjectType,
        fill: {
          R: 217,
          G: 217,
          B: 217,
        },
        fillOpacity: 100,
      };
      addElement(frame, newRectangle);
      currentDrawingElement.current = newRectangle;
    }
    if (tool.type === "text") {
      const newText: TextData = {
        ID: uuidv4(),
        name: frame.elements ? `Text ${frame.elements.length}` : "Text 0",
        width: 1,
        height: 1,
        x: pos.x - frame.x,
        y: pos.y - frame.y,
        type: "Text" as ObjectType,
        frameID: frame.ID,
        textValue: "",
        beingEdited: false,
        fill: {
          R: 0,
          G: 0,
          B: 0,
        },
        fillOpacity: 100,
      };
      addElement(frame, newText);
      currentDrawingElement.current = newText;
    }
    if (tool.type === "image" && newImageData) {
      const newImage: PictureData = {
        ID: uuidv4(),
        frameID: frame.ID,
        name: frame.elements ? `Image ${frame.elements.length}` : "Image 0",
        width: 1,
        height: 1,
        x: pos.x - frame.x,
        y: pos.y - frame.y,
        type: "Image" as ObjectType,
        imageURL: newImageData.imageURL,
        imageWidth: newImageData.imageWidth,
        imageHeight: newImageData.imageHeight,
        imageKey: newImageData.imageKey,
        fill: {
          R: 0,
          G: 0,
          B: 0,
        },
        fillOpacity: 100,
      };
      addElement(frame, newImage);
      currentDrawingElement.current = newImage;
      removeNewImageData();
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
    if (!newObject) return;
    const frame = getFrame((newObject as FrameElementData).frameID ?? "");
    const x1 = drawingPositions.current.x;
    const y1 = drawingPositions.current.y;
    const x2 = pos.x - (frame ? frame.x : 0);
    const y2 = pos.y - (frame ? frame.y : 0);
    newObject.x = Math.round(Math.min(x1, x2));
    newObject.width = Math.round(Math.abs(x2 - x1));
    // calculate aspect ratio for images
    if (newObject.type === "Image") {
      const nElement = newObject as PictureData;
      const ARwidth = nElement.imageWidth / nElement.imageHeight;
      newObject.height = Math.round(newObject.width / ARwidth);
      newObject.y = y2 < y1 ? y1 - newObject.height : y1;
    } else {
      newObject.y = Math.round(Math.min(y1, y2));
      newObject.height = Math.round(Math.abs(y2 - y1));
    }
    newObject.beingDrawn = true;
    currentDrawingElement.current = newObject;
    if (tool.type === "frame") {
      updateFrame(newObject as FrameData, false);
    } else {
      const nElement = newObject as FrameElementData;
      updateElement(nElement.frameID, nElement, false);
    }
  };

  const handleStageOnMouseUp = () => {
    const newObject = currentDrawingElement.current;
    if (!newObject) return;
    if (newObject.type === "Frame") {
      newObject.beingDrawn = false;
      updateFrame(newObject as FrameData, false);
    }
    const nElement = newObject as FrameElementData;
    if (nElement.frameID) {
      if (nElement.beingDrawn) {
        nElement.beingDrawn = false;
        updateElement(nElement.frameID, nElement, false);
        if (newObject.type === "Image" && newImageFile) {
          //void startUpload([newImageFile]);
        }
      } else {
        // Set initial values if its not being drawn
        if (nElement.type === "Image") {
          if (!newImageObject) {
            setNewImageObject({
              frameID: nElement.frameID,
              ID: nElement.ID,
            });
          }
          nElement.width = (nElement as PictureData).imageWidth;
          nElement.height = (nElement as PictureData).imageHeight;
          nElement.beingDrawn = false;
          updateElement(nElement.frameID, nElement, false);
          // upload image & change imageURL
          if (newImageFile) {
            //void startUpload([newImageFile]);
          }
        } else {
          nElement.width = 100;
          nElement.height = nElement.type === "Text" ? 25 : 100;
          nElement.beingDrawn = false;
          updateElement(nElement.frameID, nElement, false);
        }
      }
    }
    setSelectedObject(newObject);
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
    setStageScale(newScale);
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
    if (!selectedObject) return;
    if (selectedObject.type === "Frame") {
      deleteFrame((selectedObject as FrameData).ID);
    }
    const sElement = selectedObject as FrameElementData;
    if (sElement.frameID) {
      if (sElement.type === "Image") {
        void deleteUploadedImage((sElement as PictureData).imageKey);
      }
      deleteElement(sElement.frameID, sElement.ID);
    }
  }, [selectedObject, deleteFrame, deleteElement]);

  const deleteUploadedImage = async (imageKey: string) => {
    await deleteUTFiles(imageKey);
  };

  const moveSelectedObject = (place: "top" | "bottom") => {
    if (!selectedObject) return;
    if (selectedObject.type === "Frame") {
      const frame = selectedObject as FrameData;
      if (place === "top") moveFrameToTop(frame.ID);
      if (place === "bottom") moveFrameToBottom(frame.ID);
    }
    const sElement = selectedObject as FrameElementData;
    if (place === "top") moveElementToTop(sElement.frameID, sElement.ID);
    if (place === "bottom") moveElementToBottom(sElement.frameID, sElement.ID);
  };

  // eslint-disable-next-line
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const imageProps = res[0];
      if (!imageProps) {
        return;
      }
      // handle image url based on upload state
      if (newImageObject) {
        updateImageProps(newImageObject, imageProps.ufsUrl, imageProps.key);
        removeNewImageObject();
      }
      // TODO: show sonner/toast for status
      /* alert("uploaded successfully!"); */
    },
    /* onUploadError: () => {
      alert("error occurred while uploading");
    },
    onUploadBegin: (file) => {
      console.log("upload has begun for", file);
    }, */
  });

  return {
    handleStageOnMouseDown,
    handleStageOnMouseMove,
    handleStageOnMouseUp,
    checkDeselect,
    zoomStage,
    onScroll,
    deleteSelectedObject,
    moveSelectedObject,
  };
};
