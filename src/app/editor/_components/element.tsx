"use client";

import type { ObjectData } from "../page";
import type Konva from "konva";
import { Rect, Transformer } from "react-konva";
import { useEditorStore, useFrameStore } from "../store";
import { useCallback, useEffect, useRef, useState } from "react";

interface ElementProps {
  element: ObjectData;
  frameXY: { x: number; y: number };
}

interface InnerProps extends ElementProps {
  setSelectedObject: () => void;
  elementRef: React.RefObject<Konva.Rect | Konva.Circle>;
  updateElement: (frameID: string, updatedElement: ObjectData) => void;
  draggable: boolean;
  //setElementXY: (e: { x: number; y: number }) => void;
}

function ElementRect({
  element,
  frameXY,
  setSelectedObject,
  elementRef,
  updateElement,
  draggable,
  
}: InnerProps) {
  return (
    <>
      <Rect
        x={element.x + frameXY.x}
        y={element.y + frameXY.y}
        width={element.width}
        height={element.height}
        fill={"#3131D6"}
        onClick={() => setSelectedObject()}
        onTap={() => setSelectedObject()}
        onDragStart={() => setSelectedObject()}
        draggable={draggable}
        ref={elementRef as React.RefObject<Konva.Rect>}
        onTransformEnd={() => {
          const node = elementRef.current;
          if (node && element.parentID) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            const size = {
              width: Math.round(Math.max(5, node.width() * scaleX)),
              height: Math.round(Math.max(5, node.height() * scaleY)),
            };
            node.setSize(size);
            node.scaleX(1);
            node.scaleY(1);
            updateElement(element.parentID, {
              ...element,
              x: Math.round(node.x() - frameXY.x),
              y: Math.round(node.y() - frameXY.y),
              ...size,
            });
          }
        }}
        onDragEnd={() => {
          const node = elementRef.current;
          if (node && element.parentID) {
            console.log("Frame XY", frameXY.x, frameXY.y);
            console.log("Node XY", node?.x(), node?.y());
            console.log(
              "Node - Frame XY",
              node?.x() - frameXY.x,
              node?.y() - frameXY.y,
            );
            console.log("Element XY", element.x, element.y);
            /* setElementXY({
              x: Math.round(node.x() - frameXY.x),
              y: Math.round(node.y() - frameXY.y),
            }); */
            /* updateElement(element.parentID, {
              ...element,
              x: Math.round(node.x() - frameXY.x),
              y: Math.round(node.y() - frameXY.y),
            }); */
          }
        }}
      />
    </>
  );
}

export function Element({ element, frameXY }: ElementProps) {
  const tool = useEditorStore((state) => state.tool);
  const isSelected = useEditorStore(
    (state) => state.selectedObject?.id === element.id,
  );
  const setStoreSelectedObject = useEditorStore(
    (state) => state.setSelectedObject,
  );
  const setSelectedObject = useCallback(() => {
    if (tool.type === "move") setStoreSelectedObject(element);
  }, [tool.type, element]);
  const updateElement = useFrameStore((state) => state.updateElement);
  const draggable = useEditorStore((state) => state.tool.type === "move");

  const trRef = useRef<Konva.Transformer>(null);
  const elementRef = useRef<Konva.Rect | Konva.Circle>(null);
  useEffect(() => {
    if (isSelected && trRef.current && elementRef.current) {
      trRef.current.nodes([elementRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // buggy onDragEnd event solution
  /* const [elementXY, setElementXY] = useState({ x: element.x, y: element.y });
  useEffect(() => {
    const node = elementRef.current;
    if (node && element.parentID) {
      updateElement(element.parentID, {
        ...element,
        x: elementXY.x,
        y: elementXY.y,
      });
    }
  }, [elementXY]); */

  // call selectedObject to update UI

  useEffect(() => {
    if (isSelected) setSelectedObject();
  }, [element, isSelected, setSelectedObject]);

  return (
    <>
      {element.type === "Rectangle" && (
        <ElementRect
          element={element}
          frameXY={frameXY}
          setSelectedObject={() => setSelectedObject()}
          elementRef={elementRef}
          updateElement={(frameID, updatedElement) =>
            updateElement(frameID, updatedElement)
          }
          draggable={draggable}
          //setElementXY={(e) => setElementXY(e)}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          keepRatio={false}
          // TODO: enable later
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 2 || Math.abs(newBox.height) < 2) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
