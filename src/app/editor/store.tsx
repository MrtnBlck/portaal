import { create } from "zustand";
import type { ObjectData, ToolState } from "./page";
import { v4 as uuidv4 } from "uuid";
import type { ObjectType, Link, LinkData } from "./page";

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
  updateLinkedElement: (
    link: Link,
    textValue: string,
  ) => Link[] | undefined | null;
  getLinkParents: () => ObjectData[];
  getLinkChildren: () => ObjectData[];
  getLinks: () => ObjectData[];
  addLink: (cLink: Link, plink: Link) => void;
  removeLink: (cLink: Link, plink: Link) => void;
  // Image handling, unnecessary probably TODO: remove
  setImage: (
    frameID: string,
    elementID: string,
    image: HTMLImageElement,
  ) => void;
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
        name: "Children element",
        width: 270,
        height: 50,
        x: 20,
        y: 20,
        type: "Text" as ObjectType,
        parentID: frameID,
        textValue: "Ha itt atirod",
        beingEdited: false,
        links: {
          linkRole: "child",
          linkedTo: { parentID: frameID, elementID: text2ID },
          linkedElements: null,
        } as LinkData,
      } as ObjectData,
      {
        id: text2ID,
        name: "Parent element",
        width: 270,
        height: 20,
        x: 20,
        y: 70,
        type: "Text" as ObjectType,
        parentID: frameID,
        textValue: "itt is atirja",
        beingEdited: false,
        links: {
          linkRole: "parent",
          linkedTo: null,
          linkedElements: [{ parentID: frameID, elementID: text1ID }],
        } as LinkData,
      } as ObjectData,
    ] as ObjectData[],
  },
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
    {
      console.log(updatedFrame.elements?.find((e) => e.id === "tmpID")?.links, "store updateFrame");
      set((state) => ({
      frames: state.frames.map((frame) => {
        if (frame.id === updatedFrame.id) {
          if (triggerSelect)
            useEditorStore.setState({ selectedObject: updatedFrame });
          return updatedFrame;
        }
        return frame;
      }),
    }))},
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
    if (
      !element.links ||
      (!element.links.linkedTo && !element.links.linkedElements)
    ) {
      get().updateElement(frameID, updatedElement);
      return;
    }
    // links handling
    if (element.links.linkRole === "parent" && element.links.linkedElements) {
      // Parent element
      get().updateElement(frameID, updatedElement);
      element.links.linkedElements.forEach((link) => {
        get().updateLinkedElement(link, textValue);
      });
    } else if (element.links.linkRole === "child" && element.links.linkedTo) {
      // Child element
      const links = get().updateLinkedElement(
        element.links.linkedTo,
        textValue,
      );
      if (links) {
        links.forEach((link) => {
          get().updateLinkedElement(link, textValue);
        });
      }
    }
  },
  toggleTextEditing: (frameID, elementID, mode) => {
    const element = get().getElement(frameID, elementID);
    if (!element || element.type !== "Text") return;
    const updatedElement = { ...element, beingEdited: mode };
    get().updateElement(frameID, updatedElement);
  },
  // Links handling
  updateLinkedElement: (link, textValue) => {
    const linkedElement = get().getElement(link.parentID, link.elementID);
    if (!linkedElement || linkedElement.type !== "Text") return;
    const updatedLinkedElement = { ...linkedElement, textValue: textValue };
    get().updateElement(link.parentID, updatedLinkedElement);
    return linkedElement.links?.linkedElements;
  },
  getLinks: () =>
    get()
      .frames.flatMap((frame) => frame.elements ?? [])
      .filter((element) => element.links),
  getLinkParents: () =>
    get()
      .getLinks()
      .filter((element) => element.links!.linkRole === "parent"),
  getLinkChildren: () =>
    get()
      .getLinks()
      .filter((element) => element.links!.linkRole === "child"),
  addLink: (cLink, pLink) => {
    const parentElement = get().getElement(pLink.parentID, pLink.elementID);
    const childElement = get().getElement(cLink.parentID, cLink.elementID);
    if (!parentElement || !childElement) return;
    const updatedParentElement = {
      ...parentElement,
      links: {
        linkRole: "parent",
        linkedElements: parentElement.links?.linkedElements
          ? [...parentElement.links.linkedElements, cLink]
          : [cLink],
        linkedTo: null,
      } as LinkData,
    };
    const updatedChildElement = {
      ...childElement,
      links: {
        linkRole: "child",
        linkedTo: pLink,
        linkedElements: null,
      } as LinkData,
    };
    get().updateElement(pLink.parentID, updatedParentElement);
    get().updateElement(cLink.parentID, updatedChildElement);
  },
  removeLink: (cLink, plink) => {
    const parentElement = get().getElement(plink.parentID, plink.elementID);
    const childElement = get().getElement(cLink.parentID, cLink.elementID);
    if (!parentElement || !childElement) return;
    const filteredLinks = parentElement.links?.linkedElements?.filter(
      (link) => link.elementID !== cLink.elementID,
    );
    const updatedParentElement = {
      ...parentElement,
      links: {
        linkRole: "parent",
        linkedElements:
          filteredLinks && filteredLinks.length > 0 ? filteredLinks : null,
        linkedTo: null,
      } as LinkData,
    };
    const updatedChildElement = {
      ...childElement,
      links: {
        linkRole: "child",
        linkedTo: null,
        linkedElements: null,
      } as LinkData,
    };
    get().updateElement(plink.parentID, updatedParentElement);
    get().updateElement(cLink.parentID, updatedChildElement);
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
      userMode: mode
        ? mode
        : get().userMode === "normal"
          ? "designer"
          : "normal",
    });
  },
}));
