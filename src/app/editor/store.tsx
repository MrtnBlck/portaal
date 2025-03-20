import { create } from "zustand";
import type { ObjectData, ToolState } from "./page";
import { v4 as uuidv4 } from "uuid";
import type { ObjectType } from "./page";

type FrameStore = {
  // All data
  frames: ObjectData[];
  setFrames: (newFrames: ObjectData[]) => void;
  // Frame handling
  getFrameIDs: () => string[];
  getFrame: (id: string) => ObjectData | undefined;
  addFrame: (newFrame: ObjectData) => void;
  updateFrame: (updatedFrame: ObjectData, triggerSelect?: boolean) => void;
  deleteFrame: (id: string) => void;
  // Element handling
  getElementIDs: (frameID: string) => string[];
  getElement: (frameID: string, elementID: string) => ObjectData | undefined;
  addElement: (frame: ObjectData, newElement: ObjectData) => void;
  updateElement: (frameId: string, updatedElement: ObjectData, triggerSelect?: boolean) => void;
  deleteElement: (frameID: string, id: string) => void;
  // Text handling
  updateTextValue: (frameID: string, elementID: string, textValue: string) => void;
  toggleTextEditing: (frameID: string, elementID: string, mode: boolean) => void;
  // Image handling, unnecessary probably TODO: remove
  setImage: (frameID: string, elementID: string, image: HTMLImageElement) => void;
};

type EditorStore = {
  // Editor UI handling
  selectedObject: ObjectData | null;
  setSelectedObject: (object: ObjectData | null) => void;
  tool: ToolState;
  setTool: (tool: ToolState) => void;
  stageScale: number;
  setStageScale: (scale: number) => void;
  // Image handling
  uploadedImage: HTMLImageElement | null;
  addUploadedImage: (file: HTMLImageElement) => void;
  removeUploadedImage: () => void;
};

// Temporary initial data
const frameID1 = uuidv4();
const frameID2 = uuidv4();
const initialFrames: ObjectData[] = [
  {
    id: frameID1,
    name: "Frame 0",
    width: 300,
    height: 300,
    x: 300,
    y: 200,
    type: "Frame" as ObjectType,
    elements: [
      {
        id: uuidv4(),
        name: "Image 0",
        width: 500,
        height: 300,
        x: 0,
        y: 0,
        type: "Image" as ObjectType,
        parentID: frameID1,
        image: null,
      } as ObjectData,
    ] as ObjectData[],
  },
  {
    id: frameID2,
    name: "Frame 1",
    width: 400,
    height: 115,
    x: 300,
    y: 50,
    type: "Frame" as ObjectType,
    elements: [
      {
        id: uuidv4(),
        name: "Text 0",
        width: 200,
        height: 73,
        x: 50,
        y: 30,
        type: "Text" as ObjectType,
        parentID: frameID2,
        textValue: "Üdv!👋 \nKatt a másik Frame-re \nés frissítd az oldalt :)",
        beingEdited: false,
      } as ObjectData,
    ] as ObjectData[],
  }
];

export const useFrameStore = create<FrameStore>((set, get) => ({
  // All data
  frames: initialFrames,
  setFrames: (newFrames) => set({ frames: newFrames }),
  // Frame handling
  getFrameIDs: () => get().frames.map((frame) => frame.id),
  getFrame: (id) => get().frames.find((frame) => frame.id === id),
  addFrame: (newFrame) =>
    set((state) => ({ frames: [...state.frames, newFrame] })),
  updateFrame: (updatedFrame, triggerSelect = true) =>
    set((state) => ({
      frames: state.frames.map((frame) => {
        if (frame.id === updatedFrame.id) {
          if (triggerSelect) useEditorStore.setState({ selectedObject: updatedFrame });
          return updatedFrame;
        }
        return frame;
      }),
    })),
  deleteFrame: (id) => {
    set((state) => ({
      frames: state.frames.filter((frame) => frame.id !== id),
    }))
    useEditorStore.setState({ selectedObject: null });
  },
  // Element handling
  getElementIDs: (frameID) => {
    return get().getFrame(frameID)?.elements?.map((element) => element.id) ?? [];
  },
  getElement: (frameID, elementID) =>
    get()
      .getFrame(frameID)
      ?.elements?.find((element) => element.id === elementID),
  addElement: (frame, newElement) => {
    if (frame) {
      const updatedFrame = {
        ...frame,
        elements: [...(frame.elements ?? []), newElement],
      };
      get().updateFrame(updatedFrame);
    }
  },
  updateElement: (frameID, updatedElement, triggerSelect = true) => {
    const frame = get().getFrame(frameID);
    if (frame) {
      const updatedFrame = {
        ...frame,
        elements: frame.elements?.map((element) =>
          element.id === updatedElement.id ? updatedElement : element,
        ),
      };
      if (triggerSelect) useEditorStore.setState({ selectedObject: updatedElement });
      get().updateFrame(updatedFrame, false);
    }
  },
  deleteElement: (frameID, id) => {
    const frame = get().getFrame(frameID);
    if (frame) {
      const updatedFrame = {
        ...frame,
        elements: frame.elements?.filter((element) => element.id !== id),
      };
      get().updateFrame(updatedFrame);
    }
  },
  // Text handling
  updateTextValue: (frameID, elementID, textValue) => {
    const element = get().getElement(frameID, elementID);
    if (element && element.type === "Text") {
      const updatedElement = { ...element, textValue: textValue };
      get().updateElement(frameID, updatedElement);
    }
  },
  toggleTextEditing: (frameID, elementID, mode) => {
    const element = get().getElement(frameID, elementID);
    if (element && element.type === "Text") {
      const updatedElement = { ...element, beingEdited: mode };
      get().updateElement(frameID, updatedElement);
    }
  },
  // Image handling
  setImage: (frameID, elementID, image) => {
    const element = get().getElement(frameID, elementID);
    if (element && element.type === "Image") {
      const updatedElement = { ...element, image: image };
      get().updateElement(frameID, updatedElement);
    }
  },
}));

export const useEditorStore = create<EditorStore>((set) => ({
  // Editor UI handling
  selectedObject: null,
  setSelectedObject: (object) => set({ selectedObject: object }),
  tool: {
    type: "move",
    method: "selected",
  },
  setTool: (newTool) => set({ tool: newTool }),
  stageScale: 1,
  setStageScale: (scale) => set({ stageScale: scale }),
  // Image handling
  uploadedImage: null,
  addUploadedImage: (file) => set({ uploadedImage: file }),
  removeUploadedImage: () => set({ uploadedImage: null }),
}));
