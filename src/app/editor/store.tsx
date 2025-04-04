import { create } from "zustand";
import type { ObjectData, ToolState } from "./page";
import { v4 as uuidv4 } from "uuid";
import type { ObjectType, Link } from "./page";

interface LinkData {
  parentLink: Link;
  childLink: Link;
}

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
  updateElement: (
    frameId: string,
    updatedElement: ObjectData,
    triggerSelect?: boolean,
  ) => void;
  deleteElement: (frameID: string, id: string) => void;
  // Text handling
  updateTextValue: (
    frameID: string,
    elementID: string,
    textValue: string,
  ) => void;
  toggleTextEditing: (
    frameID: string,
    elementID: string,
    mode: boolean,
  ) => void;
  // Links handling
  setLinkRole: (
    frameID: string,
    elementID: string,
    role: "parent" | "child" | "none",
  ) => void;
  getRoleLinks: (role: "parent" | "child", filterID?: string) => ObjectData[];
  // Image handling
  setImage: (
    frameID: string,
    elementID: string,
    image: HTMLImageElement,
  ) => void;
};

type LinkStore = {
  links: LinkData[];
  getRelatedLinks: (elementID: string, role: string) => Link[] | Link | null;
  getSiblingLinks: (elementID: string) => Link[] | null;
  addLink: (newLink: LinkData) => void;
  removeLink: (link: LinkData) => void;
  removeRelatedLinks: (elementID: string) => void;
  updateLinkedText: (link: Link, textValue: string) => void;
  compareLinks: (fLink: LinkData, sLink: LinkData) => boolean;
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
  // User mode handling
  userMode: "normal" | "designer";
  toggleUserMode: (mode?: "normal" | "designer") => void;
};

// Temporary initial data
const frameID = uuidv4();
const text1ID = uuidv4();
const text2ID = uuidv4();
const initialFrames: ObjectData[] = [
  {
    id: frameID,
    name: "Horizontal 4:5",
    width: 310,
    height: 90,
    x: 30,
    y: 250,
    type: "Frame" as ObjectType,
    elements: [
      {
        id: text1ID,
        frameID: frameID,
        name: "Parent element",
        width: 270,
        height: 50,
        x: 20,
        y: 20,
        type: "Text" as ObjectType,
        textValue: "Ha itt atirod",
        beingEdited: false,
        linkRole: "parent",
      } as ObjectData,
      {
        id: text2ID,
        frameID: frameID,
        name: "Child element",
        width: 270,
        height: 20,
        x: 20,
        y: 70,
        type: "Text" as ObjectType,
        textValue: "itt is atirja",
        beingEdited: false,
        linkRole: "child",
      } as ObjectData,
    ] as ObjectData[],
  },
];

const initialLinks: LinkData[] = [
  {
    parentLink: {
      frameID: frameID,
      elementID: text1ID,
    },
    childLink: {
      frameID: frameID,
      elementID: text2ID,
    },
  },
];

export const useLinkStore = create<LinkStore>((set, get) => ({
  links: initialLinks,
  getParentLinks: () => {
    return get().links.map((link) => link.parentLink);
  },
  getChildLinks: () => {
    return get().links.map((link) => link.childLink);
  },
  getRelatedLinks: (elementID, role) => {
    if (role === "child") {
      const parentLink = get().links.find(
        (link) => link.childLink.elementID === elementID,
      );
      if (!parentLink) return null;
      return parentLink.parentLink;
    }
    const links = get()
      .links.filter((link) => link.parentLink.elementID === elementID)
      .map((link) => link.childLink);
    return links.length > 0 ? links : null;
  },
  getSiblingLinks: (elementID) => {
    const parentLink = get().links.find(
      (link) => link.childLink.elementID === elementID,
    );
    if (!parentLink) return null;
    const siblings = get()
      .links.filter(
        (link) => link.parentLink.elementID === parentLink.parentLink.elementID,
      )
      .map((link) => link.childLink);
    return siblings.length > 0 ? siblings : null;
  },
  addLink: (newLink) => {
    set((state) => ({
      links: [...state.links, newLink],
    }));
  },
  removeLink: (rLink) => {
    set((state) => ({
      links: state.links.filter((link) => !get().compareLinks(link, rLink)),
    }));
  },
  updateLinkedText: (link, textValue) => {
    const linkedElement = useFrameStore
      .getState()
      .getElement(link.frameID, link.elementID);
    if (!linkedElement || linkedElement.type !== "Text") return;
    const updatedLinkedElement = { ...linkedElement, textValue: textValue };
    useFrameStore.getState().updateElement(link.frameID, updatedLinkedElement);
  },
  compareLinks: (fLink, sLink) => {
    return (
      fLink.parentLink.frameID === sLink.parentLink.frameID &&
      fLink.parentLink.elementID === sLink.parentLink.elementID &&
      fLink.childLink.frameID === sLink.childLink.frameID &&
      fLink.childLink.elementID === sLink.childLink.elementID
    );
  }, 
  removeRelatedLinks: (elementID) => {
    set((state) => ({
      links: state.links.filter(
        (link) =>
          link.parentLink.elementID !== elementID &&
          link.childLink.elementID !== elementID,
      ),
    }));
  },
}));

export const useFrameStore = create<FrameStore>((set, get) => ({
  // All data
  frames: initialFrames,
  setFrames: (newFrames) => set({ frames: newFrames }),
  // Frame handling
  getFrameIDs: () => get().frames.map((frame) => frame.id),
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
  // Element handling
  getElementIDs: (frameID) => {
    return (
      get()
        .getFrame(frameID)
        ?.elements?.map((element) => element.id) ?? []
    );
  },
  getElement: (frameID, elementID) =>
    get()
      .getFrame(frameID)
      ?.elements?.find((element) => element.id === elementID),
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
        element.id === updatedElement.id ? updatedElement : element,
      ),
    };
    if (triggerSelect)
      useEditorStore.setState({ selectedObject: updatedElement });
    get().updateFrame(updatedFrame, false);
  },
  deleteElement: (frameID, id) => {
    const frame = get().getFrame(frameID);
    if (!frame) return;
    const updatedFrame = {
      ...frame,
      elements: frame.elements?.filter((element) => element.id !== id),
    };
    get().updateFrame(updatedFrame);
  },
  // Text handling
  updateTextValue: (frameID, elementID, textValue) => {
    const element = get().getElement(frameID, elementID);
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
        .getRelatedLinks(elementID, "parent") as Link[];
      if (!links) return;
      links.forEach((link) => {
        useLinkStore.getState().updateLinkedText(link, textValue);
      });
    } else if (element.linkRole === "child") {
      // Child element
      const parentLink = useLinkStore.getState().getRelatedLinks(elementID, "child") as Link | null;
      if (!parentLink) return;
      useLinkStore.getState().updateLinkedText(parentLink, textValue);
      const links = useLinkStore.getState().getSiblingLinks(elementID);
      if (!links) return;
      links.forEach((link) => {
        useLinkStore.getState().updateLinkedText(link, textValue);
      });
    }
  },
  toggleTextEditing: (frameID, elementID, mode) => {
    const element = get().getElement(frameID, elementID);
    if (!element || element.type !== "Text") return;
    const updatedElement = { ...element, beingEdited: mode };
    get().updateElement(frameID, updatedElement);
  },
  // Links handling
  setLinkRole: (frameID, elementID, role) => {
    const element = get().getElement(frameID, elementID);
    if (!element) return;
    const updatedElement = {
      ...element,
      linkRole: role === "none" ? undefined : role,
    };
    get().updateElement(frameID, updatedElement);
  },
  getRoleLinks: (role, filterID) => {
    const linkableElements = get()
      .frames.flatMap((frame) => frame.elements ?? [])
      .filter((element) => element.linkRole === role);
    if (filterID) {
      if (role === "parent") {
        // show only other parent elements
        const parentLink = useLinkStore
          .getState()
          .getRelatedLinks(filterID, "child") as Link | null;
        if (!parentLink) return linkableElements;
        const filteredElements = linkableElements.filter(
          (element) => element.id !== parentLink.elementID,
        );
        return filteredElements;
      } else if ((role = "child")) {
        // got a filterID, so this is called in a Parent element.
        // get already children links
        const relatedLinks = useLinkStore
          .getState()
          .getRelatedLinks(filterID, "parent") as Link[] | null;
        if (!relatedLinks) return linkableElements;
        // filter out elements which are already linked to this Parent element.
        const filteredElements = linkableElements.filter((element) => {
          const isLinked = relatedLinks?.some((link) => {
            return (
              element.id === link.elementID && element.frameID === link.frameID
            );
          });
          return !isLinked;
        });
        return filteredElements;
      }
    }
    return linkableElements;
  },
  // Image handling
  setImage: (frameID, elementID, image) => {
    const element = get().getElement(frameID, elementID);
    if (!element || element.type !== "Image") return;
    const updatedElement = { ...element, image: image };
    get().updateElement(frameID, updatedElement);
  },
}));

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
  uploadedImage: null,
  addUploadedImage: (file) => set({ uploadedImage: file }),
  removeUploadedImage: () => set({ uploadedImage: null }),
  // User mode handling
  userMode: "designer",
  toggleUserMode: (mode?: "normal" | "designer") => {
    set({
      userMode: mode ?? (get().userMode === "normal" ? "designer" : "normal"),
    });
  },
}));
