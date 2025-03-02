"use client";

import { Layer, Rect, Text, Transformer } from "react-konva";
import { useRef, useEffect, useState } from "react";
import type Konva from "konva";
import type { ObjectData } from "../page";

interface RectProps {
  data: ObjectData;
  fill?: string;
  onSelect: (e: ObjectData) => void;
  isSelected: boolean;
  setData: (e: ObjectData) => void;
  updateFrame: (e: ObjectData) => void;
}

interface FrameProps {
  data: ObjectData;
  onSelect: (e: ObjectData) => void;
  isSelected: boolean;
  draggable: boolean;
  children?: React.ReactNode;
  stageScale: number;
  updateFrame: (e: ObjectData) => void;
}

function FrameRect({
  data,
  fill = "#FFFFFF",
  onSelect,
  isSelected,
  setData,
  updateFrame
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
        x={data.x}
        y={data.y}
        width={data.width}
        height={data.height}
        fill={fill}
        onClick={() => onSelect(data)}
        onTap={() => onSelect(data)}
        ref={shapeRef}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            console.log(node);
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
              ...data,
              x: Math.round(node.x()),
              y: Math.round(node.y()),
              ...size,
            });
            updateFrame({
              ...data,
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
              ...data,
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
  data,
  onSelect,
  isSelected,
  draggable,
  children,
  stageScale,
  updateFrame
}: FrameProps) {
  const [ObjectData, setObjectData] = useState(data);
  const inverseScale = 1 / stageScale;
  return (
    <Layer draggable={draggable} onDragStart={() => onSelect(ObjectData)}>
      <Text
        text={ObjectData.name}
        fill={isSelected ? "#70AFDC" : "#979797"}
        x={ObjectData.x}
        y={ObjectData.y - 20 * inverseScale}
        scale={{ x: inverseScale, y: inverseScale }}
        onClick={() => onSelect(ObjectData)}
        onTap={() => onSelect(ObjectData)}
      />
      <FrameRect
        data={ObjectData}
        isSelected={isSelected}
        onSelect={() => onSelect(ObjectData)}
        setData={(e) => setObjectData(e)}
        updateFrame={(e) => updateFrame(e)}
      />
      {children}
    </Layer>
  );
}
