import { create } from "zustand";
import type { Link, FrameElement } from "./editorTypes";
import { useFrameStore } from "./frameStore";

type LinkStore = {
  links: Link[];
  setLinks: (newLinks: Link[]) => void;
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

export const useLinkStore = create<LinkStore>((set, get) => ({
  links: [],
  setLinks: (newLinks) => set({ links: newLinks }),
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
    useFrameStore
      .getState()
      .updateElement(link.frameID, updatedLinkedElement, false);
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
