import { create } from "zustand";
import type { ObjectData, ToolState } from "./page";
import { v4 as uuidv4 } from "uuid";
import type { ObjectType } from "./page";

type FrameStore = {
  frames: ObjectData[];
  setFrames: (newFrames: ObjectData[]) => void;

  getFrameIDs: () => string[];
  getFrame: (id: string) => ObjectData | undefined;
  addFrame: (newFrame: ObjectData) => void;
  updateFrame: (updatedFrame: ObjectData, triggerSelect?: boolean) => void;
  deleteFrame: (id: string) => void;

  getElementIDs: (frameID: string) => string[];
  getElement: (frameID: string, elementID: string) => ObjectData | undefined;
  addElement: (frame: ObjectData, newElement: ObjectData) => void;
  updateElement: (frameId: string, updatedElement: ObjectData, triggerSelect?: boolean) => void;
  deleteElement: (frameID: string, id: string) => void;

  updateTextValue: (frameID: string, elementID: string, textValue: string) => void;
  toggleTextEditing: (frameID: string, elementID: string, mode: boolean) => void;
};

type EditorStore = {
  selectedObject: ObjectData | null;
  setSelectedObject: (object: ObjectData | null) => void;
  tool: ToolState;
  setTool: (tool: ToolState) => void;
  stageScale: number;
  setStageScale: (scale: number) => void;
};

const frameID = uuidv4();

const initialFrames: ObjectData[] = [
  {
    id: frameID,
    name: "Frame 0",
    width: 500,
    height: 300,
    x: 300,
    y: 300,
    type: "Frame" as ObjectType,
    elements: [
      {
        id: uuidv4(),
        name: "Text 0",
        width: 100,
        height: 50,
        x: 50,
        y: 50,
        type: "Text" as ObjectType,
        parentID: frameID,
        textValue: "Üdv!👋",
        beingEdited: false,
      } as ObjectData,
    ] as ObjectData[],
  },
];

// TODO: use immer

export const useFrameStore = create<FrameStore>((set, get) => ({
  frames: initialFrames,
  setFrames: (newFrames) => set({ frames: newFrames }),
  
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
}));

export const useEditorStore = create<EditorStore>((set) => ({
  selectedObject: null,
  setSelectedObject: (object) => set({ selectedObject: object }),
  tool: {
    type: "move",
    method: "selected",
  },
  setTool: (newTool) => set({ tool: newTool }),
  stageScale: 1,
  setStageScale: (scale) => set({ stageScale: scale }),
}));
