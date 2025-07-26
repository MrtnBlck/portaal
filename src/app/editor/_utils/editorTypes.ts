export type ToolState = {
  type: "move" | "hand" | "frame" | "rectangle" | "text" | "image" | "wip";
  method: "selected" | "toggle";
};

export type ObjectType = "Frame" | "Image" | "Text" | "Rectangle" | "Group";

export type Link = {
  parentElement: FrameElement;
  childElement: FrameElement;
};

export type FrameElement = {
  id: string;
  frameId: string;
};

export type RGBColor = {
  R: number;
  G: number;
  B: number;
};

export type ObjectData = {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  type: ObjectType;
  beingDrawn?: boolean;
  fill: RGBColor;
  fillOpacity: number;
};

export type FrameElementData = ObjectData & FrameElement;

export type FrameData = ObjectData & {
  id: string;
  selectedForExport: boolean;
  elements: FrameElementData[];
};

export type NewImageData = {
  imageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageKey: string;
};

export type PictureData = FrameElementData & NewImageData;

export type TextData = FrameElementData & {
  textValue: string;
  beingEdited: boolean;
  linkRole?: "parent" | "child";
};

export type EditorData = {
  frames: FrameData[];
  links: Link[];
};

export type ProjectData = {
  id: number;
  name: string;
  type: "project" | "template";
  filterIds?: number[];
  templateOwnerId?: string;
};

export type ProjectQueryData = {
  data: never;
  id: number;
  name: string;
  ownerId: string;
  templateOwnerId?: string;
  isTemplateEditable?: boolean;
};
