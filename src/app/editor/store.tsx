import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  ToolState,
  FrameData,
  ObjectType,
  TextData,
  PictureData,
  Link,
  FrameElement,
  FrameElementData,
  ObjectData,
  RGBColor,
} from "./_utils/editorTypes";

type LinkStore = {
  links: Link[];
  getRelatedElements: (
    ID: string,
    role: string,
  ) => FrameElement[] | FrameElement | null;
  getSiblingElements: (ID: string) => FrameElement[] | null;
  addLink: (newLink: Link) => void;
  removeLink: (link: Link) => void;
  removeRelatedLinks: (ID: string) => void;
  updateLinkedText: (link: FrameElement, textValue: string) => void;
  compareLinks: (fLink: Link, sLink: Link) => boolean;
};

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
  setImage: (frameID: string, ID: string, image: HTMLImageElement) => void;
  // Fill color handling
  setFillColor: (props: {
    frameID?: string;
    ID: string;
    color?: RGBColor;
    opacity?: number;
  }) => void;
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
const initialFrames: FrameData[] = [
  {
    ID: frameID,
    name: "Horizontal 4:5",
    width: 310,
    height: 90,
    x: 30,
    y: 250,
    type: "Frame" as ObjectType,
    fill: {
      R: 255,
      G: 255,
      B: 255,
    },
    fillOpacity: 100,
    elements: [
      {
        ID: text1ID,
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
        fill: {
          R: 200,
          G: 0,
          B: 0,
        },
        fillOpacity: 50,
      } as TextData,
      {
        ID: text2ID,
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
        fill: {
          R: 0,
          G: 0,
          B: 0,
        },
        fillOpacity: 100,
      } as TextData,
    ] as FrameElementData[],
  } as FrameData,
];

const initialLinks: Link[] = [
  {
    parentElement: {
      ID: text1ID,
      frameID: frameID,
    },
    childElement: {
      ID: text2ID,
      frameID: frameID,
    },
  },
];

export const useLinkStore = create<LinkStore>((set, get) => ({
  links: initialLinks,
  getParentLinks: () => {
    return get().links.map((link) => link.parentElement);
  },
  getChildLinks: () => {
    return get().links.map((link) => link.childElement);
  },
  getRelatedElements: (ID, role) => {
    if (role === "child") {
      const currentLink = get().links.find(
        (link) => link.childElement.ID === ID,
      );
      if (!currentLink) return null;
      return currentLink.parentElement;
    }
    const links = get()
      .links.filter((link) => link.parentElement.ID === ID)
      .map((link) => link.childElement);
    return links.length > 0 ? links : null;
  },
  getSiblingElements: (ID) => {
    const currentLink = get().links.find((link) => link.childElement.ID === ID);
    if (!currentLink) return null;
    const siblings = get()
      .links.filter(
        (link) => link.parentElement.ID === currentLink.parentElement.ID,
      )
      .map((link) => link.childElement);
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
      .getElement(link.frameID, link.ID);
    if (!linkedElement || linkedElement.type !== "Text") return;
    const updatedLinkedElement = { ...linkedElement, textValue: textValue };
    useFrameStore.getState().updateElement(link.frameID, updatedLinkedElement);
  },
  compareLinks: (fLink, sLink) => {
    return (
      fLink.parentElement.frameID === sLink.parentElement.frameID &&
      fLink.parentElement.ID === sLink.parentElement.ID &&
      fLink.childElement.frameID === sLink.childElement.frameID &&
      fLink.childElement.ID === sLink.childElement.ID
    );
  },
  removeRelatedLinks: (ID) => {
    set((state) => ({
      links: state.links.filter(
        (link) => link.parentElement.ID !== ID && link.childElement.ID !== ID,
      ),
    }));
  },
}));

export const useFrameStore = create<FrameStore>((set, get) => ({
  // All data
  frames: initialFrames,
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
    // TODO: Okos szerint nem typesafe a '(element as TextData).linkRole', type guard function kene
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
  setImage: (frameID, ID, image) => {
    const element = get().getElement(frameID, ID) as PictureData | undefined;
    if (!element || element.type !== "Image") return;
    const updatedElement = { ...element, image: image };
    get().updateElement(frameID, updatedElement);
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
