import { create } from "zustand";
import type { Link, FrameElement } from "./editorTypes";
import { useFrameStore } from "./frameStore";

type LinkStore = {
  links: Link[];
  setLinks: (newLinks: Link[]) => void;
  getRelatedElements: (
    id: string,
    role: string,
  ) => FrameElement[] | FrameElement | null;
  getSiblingElements: (id: string) => FrameElement[] | null;
  addLink: (newLink: Link) => void;
  removeLink: (link: Link) => void;
  removeRelatedLinks: (id: string) => void;
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
  getRelatedElements: (id, role) => {
    if (role === "child") {
      const currentLink = get().links.find(
        (link) => link.childElement.id === id,
      );
      if (!currentLink) return null;
      return currentLink.parentElement;
    }
    const links = get()
      .links.filter((link) => link.parentElement.id === id)
      .map((link) => link.childElement);
    return links.length > 0 ? links : null;
  },
  getSiblingElements: (id) => {
    const currentLink = get().links.find((link) => link.childElement.id === id);
    if (!currentLink) return null;
    const siblings = get()
      .links.filter(
        (link) => link.parentElement.id === currentLink.parentElement.id,
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
      .getElement(link.frameId, link.id);
    if (!linkedElement || linkedElement.type !== "Text") return;
    const updatedLinkedElement = { ...linkedElement, textValue: textValue };
    useFrameStore
      .getState()
      .updateElement(link.frameId, updatedLinkedElement, false);
  },
  compareLinks: (fLink, sLink) => {
    return (
      fLink.parentElement.frameId === sLink.parentElement.frameId &&
      fLink.parentElement.id === sLink.parentElement.id &&
      fLink.childElement.frameId === sLink.childElement.frameId &&
      fLink.childElement.id === sLink.childElement.id
    );
  },
  removeRelatedLinks: (id) => {
    set((state) => ({
      links: state.links.filter(
        (link) => link.parentElement.id !== id && link.childElement.id !== id,
      ),
    }));
  },
}));
