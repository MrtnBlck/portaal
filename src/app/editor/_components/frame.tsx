"use client";

import { Layer, Rect, Text, Transformer } from "react-konva";
import { useRef, useEffect, useState } from "react";
import type Konva from "konva";
import type { ObjectData } from "../page";

interface RectProps extends Omit<FrameProps, "stageScale" | "children"> {
  setData: (e: ObjectData) => void;
  fill?: string;
}

interface FrameProps {
  frame: ObjectData;
  setSelectedObject: () => void;
  isSelected: boolean;
  updateFrame: (e: ObjectData) => void;
  draggable: boolean;
  stageScale: number;
  children?: React.ReactNode;
}

function FrameRect({
  frame,
  fill = "#FFFFFF",
  setSelectedObject,
  isSelected,
  setData,
  updateFrame,
  draggable,
}: RectProps) {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

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
        onDragStart={() => setSelectedObject()}
        draggable={draggable}
        ref={shapeRef}
        onDragEnd={() => {
          const node = shapeRef.current;
          if (node) {
            setData({
              ...frame,
              x: Math.round(node.x()),
              y: Math.round(node.y()),
            });
            updateFrame({
              ...frame,
              x: Math.round(node.x()),
              y: Math.round(node.y()),
            });
          }
        }}
        onDragMove={() => {
          const node = shapeRef.current;
          if (node) {
            setData({
              ...frame,
              x: Math.round(node.x()),
              y: Math.round(node.y()),
            });
          }
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            const size = {
              width: Math.round(Math.max(5, node.width() * scaleX)),
              height: Math.round(Math.max(5, node.height() * scaleY)),
            };

            shapeRef.current?.setSize(size);
            node.scaleX(1);
            node.scaleY(1);
            setData({
              ...frame,
              x: Math.round(node.x()),
              y: Math.round(node.y()),
              ...size,
            });
            updateFrame({
              ...frame,
              x: Math.round(node.x()),
              y: Math.round(node.y()),
              ...size,
            });
          }
        }}
        onTransform={() => {
          const node = shapeRef.current;
          // TODO: limit property updates
          // TODO: only update X,Y, do not overrite other properties
          if (node) {
            setData({
              ...frame,
              x: Math.round(node.x()),
              y: Math.round(node.y()),
            });
          }
        }}
      />
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

export function Frame({
  frame,
  setSelectedObject,
  isSelected,
  draggable,
  children,
  stageScale,
  updateFrame,
}: FrameProps) {
  const [frameState, setFrameState] = useState(frame);
  const inverseScale = 1 / stageScale;
  const setSelectedObjectRef = useRef(setSelectedObject);

  useEffect(() => {
    setFrameState(frame);
  }, [frame]);

  useEffect(() => {
    setSelectedObjectRef.current = setSelectedObject;
  }, [setSelectedObject]);

  useEffect(() => {
    setSelectedObjectRef.current();
  }, [frameState]);

  return (
    <Layer>
      <Text
        text={frameState.name}
        fill={isSelected ? "#70AFDC" : "#979797"}
        x={frameState.x}
        y={frameState.y - 20 * inverseScale}
        scale={{ x: inverseScale, y: inverseScale }}
        onClick={() => setSelectedObject()}
        onTap={() => setSelectedObject()}
      />
      <FrameRect
        frame={frameState}
        isSelected={isSelected}
        setSelectedObject={() => setSelectedObject()}
        setData={(e) => setFrameState(e)}
        updateFrame={(e) => updateFrame(e)}
        draggable={draggable}
      />
      {children}
    </Layer>
  );
}
