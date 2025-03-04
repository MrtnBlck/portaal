"use client";

import { Layer, Rect, Text, Transformer } from "react-konva";
import { useRef, useEffect, useState, useCallback } from "react";
import type Konva from "konva";
import type { ObjectData } from "../page";

interface RectProps {
  frame: ObjectData;
  fill?: string;
  setSelectedObject: () => void;
  isSelected: boolean;
  setData: (e: ObjectData) => void;
  updateFrame: (e: ObjectData) => void;
}

interface FrameProps {
  frame: ObjectData;
  setSelectedObject: () => void;
  isSelected: boolean;
  draggable: boolean;
  children?: React.ReactNode;
  stageScale: number;
  updateFrame: (e: ObjectData) => void;
}

function FrameRect({
  frame,
  fill = "#FFFFFF",
  setSelectedObject,
  isSelected,
  setData,
  updateFrame,
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
    <Layer draggable={draggable} onDragStart={() => setSelectedObject()}>
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
      />
      {children}
    </Layer>
  );
}
