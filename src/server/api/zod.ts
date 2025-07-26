import { z } from "zod";

const FrameElementSchema = z.object({
  id: z.string(),
  frameId: z.string(),
});

const ObjectTypeSchema = z.enum([
  "Frame",
  "Image",
  "Text",
  "Rectangle",
  "Group",
]);

const RGBColorSchema = z.object({
  R: z.number().min(0).max(255),
  G: z.number().min(0).max(255),
  B: z.number().min(0).max(255),
});

const ObjectDataSchema = z.object({
  name: z.string(),
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
  type: ObjectTypeSchema,
  beingDrawn: z.boolean().optional(),
  fill: RGBColorSchema,
  fillOpacity: z.number(),
});

const LinkSchema = z.object({
  parentElement: FrameElementSchema,
  childElement: FrameElementSchema,
});

const FrameElementDataSchema = ObjectDataSchema.merge(FrameElementSchema);

const PictureDataSchema = FrameElementDataSchema.extend({
  imageURL: z.string(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  imageKey: z.string(),
});

const TextDataSchema = FrameElementDataSchema.extend({
  textValue: z.string(),
  beingEdited: z.boolean(),
  linkRole: z.enum(["parent", "child"]).optional(),
});

const FrameDataSchema = ObjectDataSchema.extend({
  id: z.string(),
  selectedForExport: z.boolean(),
  elements: z
    .union([
      PictureDataSchema.strict(),
      TextDataSchema.strict(),
      FrameElementDataSchema.strict(),
    ])
    .array(),
});

export const EditorDataSchema = z.object({
  frames: FrameDataSchema.array(),
  links: LinkSchema.array(),
});

// for typescript
/* export type Link = z.infer<typeof LinkSchema>; */
