"use client";

import { Layer, Rect, Text, Transformer } from "react-konva";
import { useRef, useEffect, useState } from "react";
import type Konva from "konva";
// import { debounce } from "lodash";

interface RectProps {
  data: FrameData;
  fill?: string;
  onSelect: () => void;
  isSelected: boolean;
  setData: (e: FrameData) => void;
}

interface FrameData {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface FrameProps {
  data: FrameData;
  onSelect: () => void;
  isSelected: boolean;
  draggable: boolean;
  children?: React.ReactNode;
  stageScale: number;
}

function FrameRect({
  data,
  fill = "#FFFFFF",
  onSelect,
  isSelected,
  setData,
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
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            console.log(node);
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            const size = {
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            };

            shapeRef.current?.setSize(size);
            node.scaleX(1);
            node.scaleY(1);
            setData({
              ...data,
              x: node.x(),
              y: node.y(),
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
              x: node.x(),
              y: node.y(),
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

export function Frame({ data, onSelect, isSelected, draggable, children, stageScale }: FrameProps) {
  const [frameData, setFrameData] = useState(data);
  const inverseScale = 1 / stageScale;
  return (
    <Layer draggable={draggable} onDragStart={onSelect}>
      <Text text={frameData.name} fill={isSelected ? "#70AFDC" : "#979797"} x={frameData.x} y={frameData.y-20*inverseScale} scale={{x: inverseScale, y: inverseScale}}/>
      <FrameRect data={frameData} isSelected={isSelected} onSelect={onSelect} setData={(e) => setFrameData(e)} />
      {children}
    </Layer>
  );
}

