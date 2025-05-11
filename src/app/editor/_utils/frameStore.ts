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
  getFrameIDs: () => string[];
  getFrame: (ID: string) => FrameData | undefined;
  addFrame: (newFrame: FrameData) => void;
  updateFrame: (updatedFrame: FrameData, triggerSelect?: boolean) => void;
  deleteFrame: (ID: string) => void;
  // Frame reordering
  moveFrameToTop: (ID: string) => void;
  moveFrameToBottom: (ID: string) => void;
  // Element handling
  getElementIDs: (frameID: string) => string[];
  getElement: (frameID: string, ID: string) => FrameElementData | undefined;
  addElement: (frame: FrameData, newElement: FrameElementData) => void;
  updateElement: (
    frameID: string,
    updatedElement: FrameElementData,
    triggerSelect?: boolean,
  ) => void;
  deleteElement: (frameID: string, ID: string) => void;
  // Element reordering
  moveElementToTop: (frameID: string, ID: string) => void;
  moveElementToBottom: (frameID: string, ID: string) => void;
  // Text handling
  updateTextValue: (frameID: string, ID: string, textValue: string) => void;
  toggleTextEditing: (frameID: string, ID: string, mode: boolean) => void;
  // Links handling
  setLinkRole: (
    frameID: string,
    ID: string,
    role: "parent" | "child" | "none",
  ) => void;
  getRoleElements: (
    role: "parent" | "child",
    filterID?: string,
  ) => FrameElementData[];
  // Image handling
  updateImageProps: (
    imageObject: FrameElement,
    imageURL: string,
    imageKey: string,
  ) => void;
  // Fill color handling
  setFillColor: (props: {
    frameID?: string;
    ID: string;
    color?: RGBColor;
    opacity?: number;
  }) => void;
  // Export handling
  getExportableFrames: () => {
    ID: string;
    name: string;
    width: number;
    height: number;
    selectedForExport: boolean;
  }[];
  toggleExport: (ID: string) => void;
};

export const useFrameStore = create<FrameStore>((set, get) => ({
  // All data
  frames: [],
  setFrames: (newFrames) => set({ frames: newFrames }),
  // Frame handling
  getFrameIDs: () => get().frames.map((frame) => frame.ID),
  getFrame: (ID) => get().frames.find((frame) => frame.ID === ID),
  addFrame: (newFrame) =>
    set((state) => ({ frames: [...state.frames, newFrame] })),
  updateFrame: (updatedFrame, triggerSelect = true) => {
    set((state) => ({
      frames: state.frames.map((frame) => {
        if (frame.ID === updatedFrame.ID) {
          if (triggerSelect)
            useEditorStore.setState({ selectedObject: updatedFrame });
          return updatedFrame;
        }
        return frame;
      }),
    }));
  },
  deleteFrame: (ID) => {
    set((state) => ({
      frames: state.frames.filter((frame) => frame.ID !== ID),
    }));
    useEditorStore.setState({ selectedObject: null });
  },
  // Frame reordering
  moveFrameToTop: (ID) => {
    const frame = get().getFrame(ID);
    if (!frame) return;
    const otherFrames = get().frames.filter((frame) => frame.ID !== ID);
    const updatedFrames = [...otherFrames, frame];
    set({ frames: updatedFrames });
  },
  moveFrameToBottom: (ID) => {
    const frame = get().getFrame(ID);
    if (!frame) return;
    const otherFrames = get().frames.filter((frame) => frame.ID !== ID);
    const updatedFrames = [frame, ...otherFrames];
    set({ frames: updatedFrames });
  },
  // Element handling
  getElementIDs: (frameID) => {
    return (
      get()
        .getFrame(frameID)
        ?.elements?.map((element) => element.ID) ?? []
    );
  },
  getElement: (frameID, ID) =>
    get()
      .getFrame(frameID)
      ?.elements?.find((element) => element.ID === ID),
  addElement: (frame, newElement) => {
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      elements: [...(frame.elements ?? []), newElement],
    };
    get().updateFrame(updatedFrame);
  },
  updateElement: (frameID, updatedElement, triggerSelect = true) => {
    const frame = get().getFrame(frameID);
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      elements: frame.elements?.map((element) =>
        element.ID === updatedElement.ID ? updatedElement : element,
      ),
    };
    if (triggerSelect)
      useEditorStore.setState({ selectedObject: updatedElement });
    get().updateFrame(updatedFrame, false);
  },
  deleteElement: (frameID, ID) => {
    const frame = get().getFrame(frameID);
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      elements: frame.elements?.filter((element) => element.ID !== ID),
    };
    get().updateFrame(updatedFrame);
  },
  // Element reordering
  moveElementToTop: (frameID, ID) => {
    const frame = get().getFrame(frameID);
    if (!frame) return;
    const elements = frame.elements;
    if (!elements) return;
    const element = elements.find((element) => element.ID === ID);
    if (!element) return;
    const otherElements = elements.filter((element) => element.ID !== ID);
    const updatedFrame = {
      ...frame,
      elements: [...otherElements, element],
    };
    get().updateFrame(updatedFrame, false);
  },
  moveElementToBottom: (frameID, ID) => {
    const frame = get().getFrame(frameID);
    if (!frame) return;
    const elements = frame.elements;
    if (!elements) return;
    const element = elements.find((element) => element.ID === ID);
    if (!element) return;
    const otherElements = elements.filter((element) => element.ID !== ID);
    const updatedFrame = {
      ...frame,
      elements: [element, ...otherElements],
    };
    get().updateFrame(updatedFrame, false);
  },
  // Text handling
  updateTextValue: (frameID, ID, textValue) => {
    const element = get().getElement(frameID, ID) as TextData | undefined;
    if (!element || element.type !== "Text") return;
    const updatedElement = { ...element, textValue: textValue };
    if (!element.linkRole) {
      get().updateElement(frameID, updatedElement);
      return;
    }
    // links handling
    if (element.linkRole === "parent") {
      // Parent element
      get().updateElement(frameID, updatedElement);
      const links = useLinkStore
        .getState()
        .getRelatedElements(ID, "parent") as FrameElement[];
      if (!links) return;
      links.forEach((link) => {
        useLinkStore.getState().updateLinkedText(link, textValue);
      });
    } else if (element.linkRole === "child") {
      // Child element
      const parentLink = useLinkStore
        .getState()
        .getRelatedElements(ID, "child") as FrameElement | null;
      if (!parentLink) return;
      useLinkStore.getState().updateLinkedText(parentLink, textValue);
      const links = useLinkStore.getState().getSiblingElements(ID);
      if (!links) return;
      links.forEach((link) => {
        useLinkStore.getState().updateLinkedText(link, textValue);
      });
    }
  },
  toggleTextEditing: (frameID, ID, mode) => {
    const element = get().getElement(frameID, ID) as TextData | undefined;
    if (!element || element.type !== "Text") return;
    const updatedElement = { ...element, beingEdited: mode };
    get().updateElement(frameID, updatedElement);
  },
  // Links handling
  setLinkRole: (frameID, ID, role) => {
    const element = get().getElement(frameID, ID) as TextData | undefined;
    if (!element || element.type !== "Text") return;
    const updatedElement = {
      ...element,
      linkRole: role === "none" ? undefined : role,
    };
    get().updateElement(frameID, updatedElement);
  },
  getRoleElements: (role, filterID) => {
    const linkableElements = get()
      .frames.flatMap((frame) => frame.elements ?? [])
      .filter((element) => (element as TextData).linkRole === role);
    if (filterID) {
      if (role === "parent") {
        // show only other parent elements
        const parentLink = useLinkStore
          .getState()
          .getRelatedElements(filterID, "child") as FrameElement | null;
        if (!parentLink) return linkableElements;
        const filteredElements = linkableElements.filter(
          (element) => element.ID !== parentLink.ID,
        );
        return filteredElements;
      } else if (role === "child") {
        // got a filterID, so this is called in a Parent element.
        // get already children links
        const relatedLinks = useLinkStore
          .getState()
          .getRelatedElements(filterID, "parent") as FrameElement[] | null;
        if (!relatedLinks) return linkableElements;
        // filter out elements which are already linked to this Parent element.
        const filteredElements = linkableElements.filter((element) => {
          const isLinked = relatedLinks?.some((link) => {
            return element.ID === link.ID && element.frameID === link.frameID;
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
    const element = get().getElement(imageObject.frameID, imageObject.ID) as
      | PictureData
      | undefined;
    if (!element || element.type !== "Image") return;
    const updatedElement = {
      ...element,
      imageURL: imageURL,
      imageKey: imageKey,
    };
    get().updateElement(imageObject.frameID, updatedElement);
  },
  // Fill color handling
  setFillColor: ({ frameID, ID, color, opacity }) => {
    const element = frameID
      ? get().getElement(frameID, ID)
      : get().getFrame(ID);
    if (!element) return;
    const updatedElement = {
      ...element,
      fill: color ?? element.fill,
      fillOpacity: opacity ?? element.fillOpacity,
    };
    if (frameID) {
      get().updateElement(frameID, updatedElement as FrameElementData);
    } else {
      get().updateFrame(updatedElement as FrameData);
    }
  },
  // Export handling
  getExportableFrames: () => {
    return get().frames.map((frame) => ({
      ID: frame.ID,
      name: frame.name,
      width: frame.width,
      height: frame.height,
      selectedForExport: frame.selectedForExport,
    }));
  },
  toggleExport: (ID) => {
    const frame = get().getFrame(ID);
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      selectedForExport: !frame.selectedForExport,
    };
    get().updateFrame(updatedFrame, false);
  },
}));
