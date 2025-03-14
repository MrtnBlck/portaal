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
  updateFrame: (updatedFrame: ObjectData) => void;
  deleteFrame: (id: string) => void;

  getElementIDs: (frameID: string) => string[];
  getElement: (frameID: string, elementID: string) => ObjectData | undefined;
  addElement: (frameID: string, newElement: ObjectData) => void;
  updateElement: (frameId: string, updatedElement: ObjectData) => void;
  deleteElement: (frameID: string, id: string) => void;
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
        name: "Rectangle 0",
        width: 50,
        height: 50,
        x: 50,
        y: 50,
        type: "Rectangle" as ObjectType,
        parentID: frameID,
      } as ObjectData,
      {
        id: uuidv4(),
        name: "Rectangle 1",
        width: 50,
        height: 50,
        x: 150,
        y: 150,
        type: "Rectangle" as ObjectType,
        parentID: frameID,
      } as ObjectData,
    ] as ObjectData[],
  },
];

// TODO: use immer
// TODO: write getID's function

export const useFrameStore = create<FrameStore>((set, get) => ({
  frames: initialFrames,
  setFrames: (newFrames) => set({ frames: newFrames }),
  
  getFrameIDs: () => get().frames.map((frame) => frame.id),
  getFrame: (id) => get().frames.find((frame) => frame.id === id),
  addFrame: (newFrame) =>
    set((state) => ({ frames: [...state.frames, newFrame] })),
  updateFrame: (updatedFrame) =>
    set((state) => ({
      frames: state.frames.map((frame) => {
        if (frame.id === updatedFrame.id) {
          useEditorStore.setState({ selectedObject: updatedFrame });
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
  addElement: (frameID, newElement) => {
    const frame = get().getFrame(frameID);
    if (frame) {
      const updatedFrame = {
        ...frame,
        elements: [...(frame.elements ?? []), newElement],
      };
      get().updateFrame(updatedFrame);
      useEditorStore.setState({ selectedObject: newElement });
    }
  },
  updateElement: (frameID, updatedElement) => {
    const frame = get().getFrame(frameID);
    if (frame) {
      const updatedFrame = {
        ...frame,
        elements: frame.elements?.map((element) =>
          element.id === updatedElement.id ? updatedElement : element,
        ),
      };
      get().updateFrame(updatedFrame);
      useEditorStore.setState({ selectedObject: updatedElement });
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
      useEditorStore.setState({ selectedObject: frame });
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
