import { create } from "zustand";
import type { ObjectData, ToolState } from "./page";
import { v4 as uuidv4 } from "uuid";
import type { ObjectType } from "./page";

type FrameStore = {
  frames: ObjectData[];
  setFrames: (newFrames: ObjectData[]) => void;
  addFrame: (newFrame: ObjectData) => void;
  updateFrame: (updatedFrame: ObjectData) => void;
  deleteFrame: (id: string) => void;
  updateElement: (frameId: string, updatedElement: ObjectData) => void;
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

export const useFrameStore = create<FrameStore>((set) => ({
  frames: initialFrames,
  setFrames: (newFrames) => set({ frames: newFrames }),
  addFrame: (newFrame) =>
    set((state) => ({ frames: [...state.frames, newFrame] })),
    // TODO: test out setSelectedObject here
  updateFrame: (updatedFrame) =>
    set((state) => ({
      frames: state.frames.map((frame) =>
        frame.id === updatedFrame.id ? updatedFrame : frame,
      ),
    })),
  deleteFrame: (id) =>
    set((state) => ({
      frames: state.frames.filter((frame) => frame.id !== id),
    })),
  updateElement: (frameID, updatedElement) =>
    set((state) => ({
      frames: state.frames.map((frame) => {
        if (frame.id !== frameID) {
          return frame;
        }
        return {
          ...frame,
          elements: frame.elements?.map((element) =>
            //element.id === updatedElement.id ? updatedElement : element,
            {
              if (element.id === updatedElement.id) {
                console.log("element XY updated to:",updatedElement.x, updatedElement.y);
                return updatedElement;
              } else {
                return element;
              }
            },
          ),
        };
      }),
    })),
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
