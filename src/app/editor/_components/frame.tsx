"use client";

import { Layer, Rect, Text, Transformer, Group } from "react-konva";
import { useRef, useEffect, useState, useCallback } from "react";
import type Konva from "konva";
import { useEditorStore } from "../_utils/editorStore";
import { Element } from "./element";
import type {
  FrameData,
  FrameElementData,
  TextData,
} from "../_utils/editorTypes";
import { TinyColor } from "@ctrl/tinycolor";
import { useFrameStore } from "../_utils/frameStore";

interface RectProps {
  frame: FrameData;
  fill?: string;
  selectedObject: FrameData | FrameElementData | null;
  setSelectedObject: () => void;
  titleRef: React.RefObject<Konva.Text>;
  inverseScale: number;
}

function FrameRect({
  frame,
  selectedObject,
  setSelectedObject,
  titleRef,
  inverseScale,
}: RectProps) {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const updateFrame = useFrameStore((state) => state.updateFrame);
  const toggleTextEditing = useFrameStore((state) => state.toggleTextEditing);
  const [frameXY, setFrameXY] = useState({ x: frame.x, y: frame.y });
  const isSelected = selectedObject?.id === frame.id;
  const { R, G, B } = frame.fill;
  const userMode = useEditorStore((state) => state.userMode);

  const color = new TinyColor({
    r: R,
    g: G,
    b: B,
    a: frame.fillOpacity / 100,
  });

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group id={`export${frame.id}`}>
        <Rect
          id={frame.id}
          x={frame.x}
          y={frame.y}
          width={frame.width}
          height={frame.height}
          fill={color.toHex8String()}
          onClick={() => {
            if (
              selectedObject &&
              (selectedObject as TextData).beingEdited &&
              (selectedObject as TextData).textValue !== ""
            ) {
              toggleTextEditing(
                (selectedObject as TextData)?.frameId,
                selectedObject.id,
                false,
              );
              return;
            }
            setSelectedObject();
          }}
          onTap={() => {
            if (
              selectedObject &&
              (selectedObject as TextData).beingEdited &&
              (selectedObject as TextData).textValue !== ""
            ) {
              toggleTextEditing(
                (selectedObject as TextData)?.frameId,
                selectedObject.id,
                false,
              );
              return;
            }
            setSelectedObject();
          }}
          ref={shapeRef}
          onTransformEnd={() => {
            const node = shapeRef.current;
            if (node) {
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              const size = {
                width: Math.round(Math.max(5, node.width() * scaleX)),
                height: Math.round(Math.max(5, node.height() * scaleY)),
              };

              node.setSize(size);
              node.scaleX(1);
              node.scaleY(1);
              // Set frame XY, upon update the group XY will be reset
              updateFrame({
                ...frame,
                x: Math.round(node.x()),
                y: Math.round(node.y()),
                ...size,
              });
              setIsTransforming(false);
            }
          }}
          onTransform={() => {
            const textNode = titleRef.current;
            const frameNode = shapeRef.current;
            setIsTransforming(true);
            if (textNode && frameNode) {
              textNode.x(frameNode.x());
              textNode.y(frameNode.y() + -20 * inverseScale);
              setFrameXY({ x: frameNode.x(), y: frameNode.y() });
            }
          }}
        />
        <Group
          clipFunc={
            isSelected ||
            (selectedObject as FrameElementData)?.frameId === frame.id
              ? undefined
              : (ctx) => {
                  ctx.rect(frame.x, frame.y, frame.width, frame.height);
                }
          }
        >
          {frame.elements?.map((element) => {
            if (isTransforming) {
              return (
                <Element element={element} frameXY={frameXY} key={element.id} />
              );
            }
            return (
              <Element
                element={element}
                frameXY={{ x: frame.x, y: frame.y }}
                key={element.id}
              />
            );
          })}
        </Group>
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          rotateEnabled={false}
          keepRatio={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
          resizeEnabled={userMode === "designer"}
        />
      )}
    </>
  );
}

export function Frame({ id }: { id: string }) {
  const getFrame = useFrameStore((state) => state.getFrame);
  const frame = getFrame(id);
  const stageScale = useEditorStore((state) => state.stageScale);
  const updateFrame = useFrameStore((state) => state.updateFrame);
  const draggable = useEditorStore((state) => state.tool.type === "move");
  const tool = useEditorStore((state) => state.tool);
  const selectedObject = useEditorStore((state) => state.selectedObject) as
    | FrameData
    | FrameElementData
    | null;
  const setStoreSelectedObject = useEditorStore(
    (state) => state.setSelectedObject,
  );
  const inverseScale = 1 / stageScale;
  const groupRef = useRef<Konva.Group>(null);
  const titleRef = useRef<Konva.Text>(null);

  // Reset group XY, update the Rect's position only
  useEffect(() => {
    groupRef.current?.x(0);
    groupRef.current?.y(0);
  }, [frame]);

  const setSelectedObject = useCallback(() => {
    if (tool.type === "move" && frame) setStoreSelectedObject(frame);
  }, [tool.type, frame, setStoreSelectedObject]);

  if (!frame) return null;

  return (
    <Layer>
      <Group
        ref={groupRef}
        draggable={draggable}
        onDragEnd={() => {
          const node = groupRef.current;
          if (node) {
            updateFrame({
              ...frame,
              x: Math.round(node.x() + frame.x),
              y: Math.round(node.y() + frame.y),
            });
          }
        }}
      >
        <FrameRect
          frame={frame}
          selectedObject={selectedObject}
          setSelectedObject={() => setSelectedObject()}
          titleRef={titleRef}
          inverseScale={inverseScale}
        />
        <Text
          text={frame.name}
          fill={selectedObject?.id === frame.id ? "#70AFDC" : "#979797"}
          x={frame.x}
          y={frame.y + -20 * inverseScale}
          scale={{ x: inverseScale, y: inverseScale }}
          onClick={() => setSelectedObject()}
          onTap={() => setSelectedObject()}
          ref={titleRef}
        />
      </Group>
    </Layer>
  );
}
