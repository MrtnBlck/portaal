import { create } from "zustand";
import type {
  FrameData,
  TextData,
  PictureData,
  FrameElement,
  FrameElementData,
  RGBColor,
} from "./editorTypes";
import { useEditorStore } from "./editorStore";
import { useLinkStore } from "./linkStore";

type FrameStore = {
  // All data
  frames: FrameData[];
  setFrames: (newFrames: FrameData[]) => void;
  // Frame handling
  getFrameIds: () => string[];
  getFrame: (id: string) => FrameData | undefined;
  addFrame: (newFrame: FrameData) => void;
  updateFrame: (updatedFrame: FrameData, triggerSelect?: boolean) => void;
  deleteFrame: (id: string) => void;
  // Frame reordering
  moveFrameToTop: (id: string) => void;
  moveFrameToBottom: (id: string) => void;
  // Element handling
  setFrameElements: (frameId: string, elements: FrameElementData[]) => void;
  getElementIds: (frameId: string) => string[];
  getElement: (frameId: string, id: string) => FrameElementData | undefined;
  addElement: (frame: FrameData, newElement: FrameElementData) => void;
  updateElement: (
    frameId: string,
    updatedElement: FrameElementData,
    triggerSelect?: boolean,
  ) => void;
  deleteElement: (frameId: string, id: string) => void;
  // Element reordering
  moveElementToTop: (frameId: string, id: string) => void;
  moveElementToBottom: (frameId: string, id: string) => void;
  // Text handling
  updateTextValue: (frameId: string, id: string, textValue: string) => void;
  toggleTextEditing: (frameId: string, id: string, mode: boolean) => void;
  // Links handling
  setLinkRole: (
    frameId: string,
    id: string,
    role: "parent" | "child" | "none",
  ) => void;
  getRoleElements: (
    role: "parent" | "child",
    filterId?: string,
  ) => FrameElementData[];
  // Image handling
  updateImageProps: (
    imageObject: FrameElement,
    imageURL: string,
    imageKey: string,
  ) => void;
  // Fill color handling
  setFillColor: (props: {
    frameId?: string;
    id: string;
    color?: RGBColor;
    opacity?: number;
  }) => void;
  // Export handling
  getExportableFrames: () => {
    id: string;
    name: string;
    width: number;
    height: number;
    selectedForExport: boolean;
  }[];
  toggleExport: (id: string) => void;
};

export const useFrameStore = create<FrameStore>((set, get) => ({
  // All data
  frames: [],
  setFrames: (newFrames) => set({ frames: newFrames }),
  // Frame handling
  getFrameIds: () => get().frames.map((frame) => frame.id),
  getFrame: (id) => get().frames.find((frame) => frame.id === id),
  addFrame: (newFrame) =>
    set((state) => ({ frames: [...state.frames, newFrame] })),
  updateFrame: (updatedFrame, triggerSelect = true) => {
    set((state) => ({
      frames: state.frames.map((frame) => {
        if (frame.id === updatedFrame.id) {
          if (triggerSelect)
            useEditorStore.setState({ selectedObject: updatedFrame });
          return updatedFrame;
        }
        return frame;
      }),
    }));
  },
  deleteFrame: (id) => {
    set((state) => ({
      frames: state.frames.filter((frame) => frame.id !== id),
    }));
    useEditorStore.setState({ selectedObject: null });
  },
  // Frame reordering
  moveFrameToTop: (id) => {
    const frame = get().getFrame(id);
    if (!frame) return;
    const otherFrames = get().frames.filter((frame) => frame.id !== id);
    const updatedFrames = [...otherFrames, frame];
    set({ frames: updatedFrames });
  },
  moveFrameToBottom: (id) => {
    const frame = get().getFrame(id);
    if (!frame) return;
    const otherFrames = get().frames.filter((frame) => frame.id !== id);
    const updatedFrames = [frame, ...otherFrames];
    set({ frames: updatedFrames });
  },
  // Element handling
  setFrameElements: (frameId, elements) => {
    const frame = get().getFrame(frameId);
    if (!frame) return;
    const updatedFrame = { ...frame, elements: elements };
    get().updateFrame(updatedFrame, false);
  },
  getElementIds: (frameId) => {
    return (
      get()
        .getFrame(frameId)
        ?.elements?.map((element) => element.id) ?? []
    );
  },
  getElement: (frameId, id) =>
    get()
      .getFrame(frameId)
      ?.elements?.find((element) => element.id === id),
  addElement: (frame, newElement) => {
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      elements: [...(frame.elements ?? []), newElement],
    };
    get().updateFrame(updatedFrame);
  },
  updateElement: (frameId, updatedElement, triggerSelect = true) => {
    const frame = get().getFrame(frameId);
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      elements: frame.elements?.map((element) =>
        element.id === updatedElement.id ? updatedElement : element,
      ),
    };
    if (triggerSelect)
      useEditorStore.setState({ selectedObject: updatedElement });
    get().updateFrame(updatedFrame, false);
  },
  deleteElement: (frameId, id) => {
    const frame = get().getFrame(frameId);
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      elements: frame.elements?.filter((element) => element.id !== id),
    };
    get().updateFrame(updatedFrame);
  },
  // Element reordering
  moveElementToTop: (frameId, id) => {
    const frame = get().getFrame(frameId);
    if (!frame) return;
    const elements = frame.elements;
    if (!elements) return;
    const element = elements.find((element) => element.id === id);
    if (!element) return;
    const otherElements = elements.filter((element) => element.id !== id);
    const updatedFrame = {
      ...frame,
      elements: [...otherElements, element],
    };
    get().updateFrame(updatedFrame, false);
  },
  moveElementToBottom: (frameId, id) => {
    const frame = get().getFrame(frameId);
    if (!frame) return;
    const elements = frame.elements;
    if (!elements) return;
    const element = elements.find((element) => element.id === id);
    if (!element) return;
    const otherElements = elements.filter((element) => element.id !== id);
    const updatedFrame = {
      ...frame,
      elements: [element, ...otherElements],
    };
    get().updateFrame(updatedFrame, false);
  },
  // Text handling
  updateTextValue: (frameId, id, textValue) => {
    const element = get().getElement(frameId, id) as TextData | undefined;
    if (!element || element.type !== "Text") return;
    const updatedElement = { ...element, textValue: textValue };
    if (!element.linkRole) {
      get().updateElement(frameId, updatedElement);
      return;
    }
    // links handling
    if (element.linkRole === "parent") {
      // Parent element
      get().updateElement(frameId, updatedElement);
      const links = useLinkStore
        .getState()
        .getRelatedElements(id, "parent") as FrameElement[];
      if (!links) return;
      links.forEach((link) => {
        useLinkStore.getState().updateLinkedText(link, textValue);
      });
    } else if (element.linkRole === "child") {
      // Child element
      const parentLink = useLinkStore
        .getState()
        .getRelatedElements(id, "child") as FrameElement | null;
      if (!parentLink) return;
      useLinkStore.getState().updateLinkedText(parentLink, textValue);
      const links = useLinkStore.getState().getSiblingElements(id);
      if (!links) return;
      links.forEach((link) => {
        useLinkStore.getState().updateLinkedText(link, textValue);
      });
    }
  },
  toggleTextEditing: (frameId, id, mode) => {
    const element = get().getElement(frameId, id) as TextData | undefined;
    if (!element || element.type !== "Text") return;
    const updatedElement = { ...element, beingEdited: mode };
    get().updateElement(frameId, updatedElement);
  },
  // Links handling
  setLinkRole: (frameId, id, role) => {
    const element = get().getElement(frameId, id) as TextData | undefined;
    if (!element || element.type !== "Text") return;
    const updatedElement = {
      ...element,
      linkRole: role === "none" ? undefined : role,
    };
    get().updateElement(frameId, updatedElement);
  },
  getRoleElements: (role, filterId) => {
    const linkableElements = get()
      .frames.flatMap((frame) => frame.elements ?? [])
      .filter((element) => (element as TextData).linkRole === role);
    if (filterId) {
      if (role === "parent") {
        // show only other parent elements
        const parentLink = useLinkStore
          .getState()
          .getRelatedElements(filterId, "child") as FrameElement | null;
        if (!parentLink) return linkableElements;
        const filteredElements = linkableElements.filter(
          (element) => element.id !== parentLink.id,
        );
        return filteredElements;
      } else if (role === "child") {
        // got a filterId, so this is called in a Parent element.
        // get already children links
        const relatedLinks = useLinkStore
          .getState()
          .getRelatedElements(filterId, "parent") as FrameElement[] | null;
        if (!relatedLinks) return linkableElements;
        // filter out elements which are already linked to this Parent element.
        const filteredElements = linkableElements.filter((element) => {
          const isLinked = relatedLinks?.some((link) => {
            return element.id === link.id && element.frameId === link.frameId;
          });
          return !isLinked;
        });
        return filteredElements;
      }
    }
    return linkableElements;
  },
  // Image handling
  updateImageProps: (imageObject, imageURL, imageKey) => {
    const element = get().getElement(imageObject.frameId, imageObject.id) as
      | PictureData
      | undefined;
    if (!element || element.type !== "Image") return;
    const updatedElement = {
      ...element,
      imageURL: imageURL,
      imageKey: imageKey,
    };
    get().updateElement(imageObject.frameId, updatedElement);
  },
  // Fill color handling
  setFillColor: ({ frameId, id, color, opacity }) => {
    const element = frameId
      ? get().getElement(frameId, id)
      : get().getFrame(id);
    if (!element) return;
    const updatedElement = {
      ...element,
      fill: color ?? element.fill,
      fillOpacity: opacity ?? element.fillOpacity,
    };
    if (frameId) {
      get().updateElement(frameId, updatedElement as FrameElementData);
    } else {
      get().updateFrame(updatedElement as FrameData);
    }
  },
  // Export handling
  getExportableFrames: () => {
    return get().frames.map((frame) => ({
      id: frame.id,
      name: frame.name,
      width: frame.width,
      height: frame.height,
      selectedForExport: frame.selectedForExport,
    }));
  },
  toggleExport: (id) => {
    const frame = get().getFrame(id);
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      selectedForExport: !frame.selectedForExport,
    };
    get().updateFrame(updatedFrame, false);
  },
}));
