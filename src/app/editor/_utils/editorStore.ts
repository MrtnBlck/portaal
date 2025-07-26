import { create } from "zustand";
import type {
  ToolState,
  NewImageData,
  ObjectData,
  FrameElement,
  ProjectData,
} from "./editorTypes";

type EditorStore = {
  // Project/Template Data
  projectData: ProjectData | null;
  setProjectData: (data: ProjectData) => void;
  // Editor UI handling
  selectedObject: ObjectData | null;
  setSelectedObject: (object: ObjectData | null) => void;
  tool: ToolState;
  setTool: (tool: ToolState) => void;
  stageScale: number;
  setStageScale: (scale: number) => void;
  // Image handling
  newImageData: NewImageData | null;
  addNewImageData: (newImageData: NewImageData) => void;
  removeNewImageData: () => void;
  // tmp file storing for postponed upload
  newImageFile: File | null;
  setNewImageFile: (newImageFile: File) => void;
  removeNewImageFile: () => void;
  // file upload queue
  uploadQueue: FrameElement[];
  addToUploadQueue: (newElement: FrameElement) => void;
  removeFromUploadQueue: (removeElement: FrameElement) => void;
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
  // Project/Template Data
  projectData: null,
  setProjectData: (data) => {
    set({ projectData: data });
  },
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
  // tmp file storing for postponed upload
  newImageFile: null,
  setNewImageFile: (newImageFile) => set({ newImageFile: newImageFile }),
  removeNewImageFile: () => set({ newImageFile: null }),
  // file upload queue
  uploadQueue: [],
  addToUploadQueue: (newElement) => {
    const uploadQueue = get().uploadQueue;
    const updatedUploadQueue = [...uploadQueue, newElement];
    set({ uploadQueue: updatedUploadQueue });
  },
  removeFromUploadQueue: (removeElement) => {
    const uploadQueue = get().uploadQueue;
    const updatedUploadQueue = uploadQueue.filter(
      (element) => element.id !== removeElement.id,
    );
    set({ uploadQueue: updatedUploadQueue });
  },
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
