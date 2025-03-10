"use client";

import { Layer, Rect, Text, Transformer, Group } from "react-konva";
import { useRef, useEffect, useState, useCallback } from "react";
import type Konva from "konva";
import type { ObjectData } from "../page";
import { useFrameStore, useEditorStore } from "../store";
import { Element } from "./element";

interface RectProps extends Omit<FrameProps, "stageScale" | "draggable"> {
  fill?: string;
  isSelected: boolean;
  setSelectedObject: () => void;
  titleRef: React.RefObject<Konva.Text>;
  inverseScale: number;
}

//TODO: New structure: Layer(Group[draggable](Text, RectFrame, Group(Content), Transformer))

interface FrameProps {
  frame: ObjectData;
}

function FrameRect({
  frame,
  fill = "#FFFFFF",
  isSelected,
  setSelectedObject,
  titleRef,
  inverseScale,
}: RectProps) {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const isTransformingRef = useRef(false);
  const updateFrame = useFrameStore((state) => state.updateFrame);
  const [frameXY, setFrameXY] = useState({ x: frame.x, y: frame.y });

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        x={frame.x}
        y={frame.y}
        width={frame.width}
        height={frame.height}
        fill={fill}
        onClick={() => setSelectedObject()}
        onTap={() => setSelectedObject()}
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
            isTransformingRef.current = false;
          }
        }}
        onTransform={() => {
          const textNode = titleRef.current;
          const frameNode = shapeRef.current;
          isTransformingRef.current = true;
          if (textNode && frameNode) {
            textNode.x(frameNode.x());
            textNode.y(frameNode.y() + -20 * inverseScale);
            setFrameXY({ x: frameNode.x(), y: frameNode.y() });
          }
        }}
      />
      <Group
        clipFunc={
          isSelected
            ? undefined
            : (ctx) => {
                ctx.rect(frame.x, frame.y, frame.width, frame.height);
              }
        }
      >
        {frame.elements?.map((element) => {
          const node = shapeRef.current;
          // Look into ref, change to state
          if (node) {
            if (isTransformingRef.current) {
              console.log("Transforming");
              return (
                <Element element={element} frameXY={frameXY} key={element.id} />
              );
            }
            console.log("Not Transforming");
            return (
              <Element
                element={element}
                frameXY={{ x: frame.x, y: frame.y }}
                key={element.id}
              />
            );
          }
          return null;
        })}
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
        />
      )}
    </>
  );
}

export function Frame({ frame }: FrameProps) {
  const stageScale = useEditorStore((state) => state.stageScale);
  const updateFrame = useFrameStore((state) => state.updateFrame);
  const draggable = useEditorStore((state) => state.tool.type === "move");
  const tool = useEditorStore((state) => state.tool);
  const setStoreSelectedObject = useEditorStore(
    (state) => state.setSelectedObject,
  );
  const setSelectedObject = useCallback(() => {
    if (tool.type === "move") setStoreSelectedObject(frame);
  }, [tool.type, frame]);
  const isSelected = useEditorStore(
    (state) => state.selectedObject?.id === frame.id,
  );
  const inverseScale = 1 / stageScale;
  const setSelectedObjectRef = useRef(setSelectedObject);
  const groupRef = useRef<Konva.Group>(null);
  const titleRef = useRef<Konva.Text>(null);

  // Reset group XY, update the Rect's position only
  useEffect(() => {
    groupRef.current?.x(0);
    groupRef.current?.y(0);
  }, [frame]);

  // Call selectedObject to update UI
  useEffect(() => {
    if (isSelected) setSelectedObject();
  }, [frame, isSelected, setSelectedObject]);

  return (
    <Layer id="myLayer">
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
          isSelected={isSelected}
          setSelectedObject={() => setSelectedObject()}
          titleRef={titleRef}
          inverseScale={inverseScale}
        />
        <Text
          text={frame.name}
          fill={isSelected ? "#70AFDC" : "#979797"}
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
