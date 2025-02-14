"use client";

import { Layer, Rect, Text, Transformer } from "react-konva";
import { useRef, useEffect } from "react";
import Konva from "konva";

interface RectProps {
  width: number;
  height: number;
  fill?: string;
  id: string;
  onSelect: () => void;
  isSelected: boolean;
  onChange?: (newProps: any) => void;
}

interface FrameProps {
  x?: number;
  y?: number;
  name: string;
  children?: React.ReactNode;
  rectProps: RectProps;
}

function FrameRect({
  width,
  height,
  fill = "#FFFFFF",
  id,
  onSelect,
  isSelected,
  onChange,
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
        y={20}
        width={width}
        height={height}
        fill={fill}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
        
            node.scaleX(1);
            node.scaleY(1);
            onChange?.({
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            });
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          rotateEnabled={false}
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

export function Frame({ x, y, name, children, rectProps }: FrameProps) {
  return (
    <Layer draggable={true} x={x} y={y}>
      <Text text={name} fill="#979797" />
      <FrameRect {...rectProps} />
      {children}
    </Layer>
  );
}
