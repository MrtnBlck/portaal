import type { KonvaEventObject } from "konva/lib/Node";
import { useEditorStore } from "./editorStore";
import { useFrameStore } from "./frameStore";
import { useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type Konva from "konva";
import type {
  FrameData,
  FrameElement,
  FrameElementData,
  ObjectData,
  ObjectType,
  PictureData,
  TextData,
} from "./editorTypes";
import { useUploadThing } from "~/utils/uploadthing";
import { deleteUTFiles } from "~/server/api/utapi";
import { showImageUploadToast } from "../_components/imageUploadToast";
import { useMutationHandlers } from "~/app/_hooks/useMutationHandlers";
import { useLinkStore } from "./linkStore";

export const useStageUtils = () => {
  const tool = useEditorStore((state) => state.tool);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const setSelectedObject = useEditorStore((state) => state.setSelectedObject);
  const frames = useFrameStore((state) => state.frames);
  const links = useLinkStore((state) => state.links);
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
  const newImageFile = useEditorStore((state) => state.newImageFile);
  const moveFrameToTop = useFrameStore((state) => state.moveFrameToTop);
  const moveFrameToBottom = useFrameStore((state) => state.moveFrameToBottom);
  const moveElementToTop = useFrameStore((state) => state.moveElementToTop);
  const moveElementToBottom = useFrameStore(
    (state) => state.moveElementToBottom,
  );
  const projectData = useEditorStore((state) => state.projectData);
  const addToUploadQueue = useEditorStore((state) => state.addToUploadQueue);
  const removeFromUploadQueue = useEditorStore(
    (state) => state.removeFromUploadQueue,
  );
  const { updateProject, updateTemplate } = useMutationHandlers();

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
        toggleTextEditing(sElement.frameId, sElement.id, false);
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
        id: uuidv4(),
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
    const frameId = (
      targetAttrs.frameId === undefined ? targetAttrs.id : targetAttrs.frameId
    ) as string;
    if (!frameId) return;
    const frame = getFrame(frameId);
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
        id: uuidv4(),
        frameId: frame.id,
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
        id: uuidv4(),
        name: frame.elements ? `Text ${frame.elements.length}` : "Text 0",
        width: 1,
        height: 1,
        x: pos.x - frame.x,
        y: pos.y - frame.y,
        type: "Text" as ObjectType,
        frameId: frame.id,
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
        id: uuidv4(),
        frameId: frame.id,
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
    const frame = getFrame((newObject as FrameElementData).frameId ?? "");
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
      updateElement(nElement.frameId, nElement, false);
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
    if (nElement.frameId) {
      if (nElement.beingDrawn) {
        nElement.beingDrawn = false;
        updateElement(nElement.frameId, nElement, false);
        if (newObject.type === "Image" && newImageFile) {
          void updateUrlUpload(newImageFile, {
            id: nElement.id,
            frameId: nElement.frameId,
          });
        }
      } else {
        // Set initial values if its not being drawn
        if (nElement.type === "Image") {
          nElement.width = (nElement as PictureData).imageWidth;
          nElement.height = (nElement as PictureData).imageHeight;
          nElement.beingDrawn = false;
          updateElement(nElement.frameId, nElement, false);
          // upload image & change imageURL
          if (newImageFile) {
            void updateUrlUpload(newImageFile, {
              id: nElement.id,
              frameId: nElement.frameId,
            });
          }
        } else {
          nElement.width = 100;
          nElement.height = nElement.type === "Text" ? 25 : 100;
          nElement.beingDrawn = false;
          updateElement(nElement.frameId, nElement, false);
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
      deleteFrame((selectedObject as FrameData).id);
    }
    const sElement = selectedObject as FrameElementData;
    if (sElement.frameId) {
      if (sElement.type === "Image") {
        void deleteUploadedImage((sElement as PictureData).imageKey);
      }
      deleteElement(sElement.frameId, sElement.id);
    }
  }, [selectedObject, deleteFrame, deleteElement]);

  const deleteUploadedImage = async (imageKey: string) => {
    await deleteUTFiles(imageKey);
  };

  const moveSelectedObject = (place: "top" | "bottom") => {
    if (!selectedObject) return;
    if (selectedObject.type === "Frame") {
      const frame = selectedObject as FrameData;
      if (place === "top") moveFrameToTop(frame.id);
      if (place === "bottom") moveFrameToBottom(frame.id);
    }
    const sElement = selectedObject as FrameElementData;
    if (place === "top") moveElementToTop(sElement.frameId, sElement.id);
    if (place === "bottom") moveElementToBottom(sElement.frameId, sElement.id);
  };

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadBegin: (fileName) => {
      showImageUploadToast({
        type: "start",
        title: `Uploading ${fileName}`,
        description: "Project save is temporarily disabled",
      });
    },
  });

  const updateUrlUpload = async (file: File, imageObject: FrameElement) => {
    addToUploadQueue(imageObject);
    startUpload([file])
      .then((res) => {
        if (!res || res.length === 0) {
          showImageUploadToast({
            type: "error",
            title: "Error uploading image",
            description: "No response from server",
          });
          return;
        }
        const imageProps = res[0];
        if (!imageProps) {
          showImageUploadToast({
            type: "error",
            title: "Error uploading image",
            description: "No valid response from server",
          });
          return;
        }
        updateImageProps(imageObject, imageProps.ufsUrl, imageProps.key);
        showImageUploadToast({
          type: "success",
          title: "Upload complete",
          description: "The project has been saved",
        });
        removeFromUploadQueue(imageObject);
        if (!projectData) return null;
        const { id: projectId, type: projectType } = projectData;
        if (projectType === "project") {
          updateProject({
            projectId: String(projectId),
            data: {
              frames: frames,
              links: links,
            },
          });
        } else if (projectType === "template") {
          updateTemplate({
            templateId: String(projectId),
            data: {
              frames: frames,
              links: links,
            },
          });
        }
      })
      .catch((err) => {
        const error = err as string;
        showImageUploadToast({
          type: "error",
          title: "Error uploading image",
          description: error,
        });
        //TODO: add retry logic
      });
  };

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
