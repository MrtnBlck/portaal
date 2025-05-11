import { create } from "zustand";
import type {
  ToolState,
  NewImageData,
  FrameElement,
  ObjectData,
} from "./editorTypes";

type EditorStore = {
  // Editor UI handling
  selectedObject: ObjectData | null;
  setSelectedObject: (object: ObjectData | null) => void;
  tool: ToolState;
  setTool: (tool: ToolState) => void;
  stageScale: number;
  setStageScale: (scale: number) => void;
  // Image handling
  // size & tmp src
  newImageData: NewImageData | null;
  addNewImageData: (newImageData: NewImageData) => void;
  removeNewImageData: () => void;
  // url update
  newImageObject: FrameElement | null;
  setNewImageObject: (newImageObject: FrameElement) => void;
  removeNewImageObject: () => void;
  // tmp file storing for postponed upload
  newImageFile: File | null;
  setNewImageFile: (newImageFile: File) => void;
  removeNewImageFile: () => void;
  // User mode handling
  userMode: "normal" | "designer";
  toggleUserMode: (mode?: "normal" | "designer") => void;
  // Lock user mode
  isEditable: boolean;
  setIsEditable: (isEditable: boolean) => void;
  isTemplateOwner: boolean;
  setIsTemplateOwner: (isTemplateOwner: boolean) => void;
};

export const useEditorStore = create<EditorStore>((set, get) => ({
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
  newImageData: null,
  addNewImageData: (newImageData) => set({ newImageData: newImageData }),
  removeNewImageData: () => set({ newImageData: null }),
  newImageObject: null,
  setNewImageObject: (newImageObject) =>
    set({ newImageObject: newImageObject }),
  removeNewImageObject: () => set({ newImageObject: null }),
  newImageFile: null,
  setNewImageFile: (newImageFile) => set({ newImageFile: newImageFile }),
  removeNewImageFile: () => set({ newImageFile: null }),
  // User mode handling
  userMode: "normal",
  toggleUserMode: (mode?: "normal" | "designer") => {
    set({
      userMode: mode ?? (get().userMode === "normal" ? "designer" : "normal"),
    });
  },
  // Lock user mode
  isEditable: true,
  setIsEditable: (isEditable) => set({ isEditable: isEditable }),
  isTemplateOwner: false,
  setIsTemplateOwner: (isTemplateOwner) =>
    set({ isTemplateOwner: isTemplateOwner }),
}));
