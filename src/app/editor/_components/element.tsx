"use client";

import type { ObjectData } from "../page";
import type Konva from "konva";
import { Html } from "react-konva-utils";
import { Rect, Transformer, Text } from "react-konva";
import { useEditorStore, useFrameStore } from "../store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ElementProps {
  element: ObjectData;
  frameXY: { x: number; y: number };
}

interface ElementTextProps {
  element: ObjectData;
  props: CommonProps;
  elementRef: Konva.Text;
  setElementRef: (ref: Konva.Text) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

interface CommonProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  draggable: boolean;
  onClick: () => void;
  onTap: () => void;
  onDragStart: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<Event>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

function ElementText({
  element,
  props,
  elementRef,
  setElementRef,
  isEditing,
  setIsEditing,
}: ElementTextProps) {
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  const updateTextValue = useFrameStore((state) => state.updateTextValue);
  const style = useMemo(() => {
    if (!elementRef) return undefined;
    return {
      width: `${elementRef.width() - elementRef.padding() * 2}px`,
      height: `${elementRef.height() - elementRef.padding() * 2 + 5}px`,
      fontSize: `${elementRef.fontSize()}px`,
      border: "none",
      padding: "0px",
      margin: "0px",
      background: "none",
      outline: "none",
      resize: "none" as const,
      lineHeight: `${elementRef.lineHeight()}`,
      fontFamily: elementRef.fontFamily(),
      transformOrigin: "left top",
      textAlign: elementRef.align() as "left" | "center" | "right" | "justify",
      color: elementRef.fill() as string,
      marginTop: isFirefox ? "-4px" : "0px",
      overflow: "hidden",
    };
  }, [elementRef?.width(), elementRef?.height(), isFirefox]);

  const [inputValue, setInputValue] = useState(element.textValue!);

  const handleOnBlur = () => {
    if (!element.parentID) return;
    setIsEditing(false);
    if (inputValue !== element.textValue) {
      updateTextValue(element.parentID, element.id, inputValue);
    }
  };

  return (
    <>
      {isEditing && (
        <Html
          groupProps={{ x: props.x, y: props.y }}
          divProps={{ style: { opacity: 1 } }}
        >
          <textarea
            value={inputValue}
            style={style}
            onBlur={handleOnBlur}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleOnBlur();
              }
            }}
          />
        </Html>
      )}
      <Text
        text={element.textValue}
        fontSize={20}
        ref={setElementRef}
        onTransform={(e) => {
          e.cancelBubble = true;
          if (!elementRef || !element.parentID) return;
          const scaleX = elementRef.scaleX();
          const scaleY = elementRef.scaleY();
          const size = {
            width: Math.round(Math.max(5, elementRef.width() * scaleX)),
            height: Math.round(Math.max(5, elementRef.height() * scaleY)),
          };
          elementRef.setSize(size);
          elementRef.scaleX(1);
          elementRef.scaleY(1);
        }}
        onDblClick={() => setIsEditing(true)}
        visible={!isEditing}
        {...props}
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
  }, [tool.type, element, setStoreSelectedObject]);
  const updateElement = useFrameStore((state) => state.updateElement);
  const draggable = useEditorStore((state) => state.tool.type === "move");
  const trRef = useRef<Konva.Transformer>(null);
  const [elementRef, setElementRef] = useState<Konva.Rect | Konva.Text | null>(
    null,
  );

  useEffect(() => {
    if (isSelected && trRef.current && elementRef) {
      trRef.current.nodes([elementRef]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, elementRef]);

  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false);
    }
  }, [isSelected, isEditing]);

  useEffect(() => {
    if (!element.beingDrawn && element.type === "Text") {
      setIsEditing(true);
    }
  }, [element.beingDrawn]);

  const commonProps: CommonProps = {
    x: element.x + frameXY.x,
    y: element.y + frameXY.y,
    width: element.width,
    height: element.height,
    fill: "black",
    draggable: draggable,
    onClick: setSelectedObject,
    onTap: setSelectedObject,
    onDragStart: setSelectedObject,
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      e.cancelBubble = true;
      if (!elementRef || !element.parentID) return;
      const scaleX = elementRef.scaleX();
      const scaleY = elementRef.scaleY();
      const size = {
        width: Math.round(Math.max(5, elementRef.width() * scaleX)),
        height: Math.round(Math.max(5, elementRef.height() * scaleY)),
      };
      elementRef.setSize(size);
      elementRef.scaleX(1);
      elementRef.scaleY(1);
      updateElement(element.parentID, {
        ...element,
        x: Math.round(elementRef.x() - frameXY.x),
        y: Math.round(elementRef.y() - frameXY.y),
        ...size,
      });
    },
    onDragEnd: (e: Konva.KonvaEventObject<Event>) => {
      e.cancelBubble = true;
      if (!elementRef || !element.parentID) return;
      updateElement(element.parentID, {
        ...element,
        x: Math.round(elementRef.x() - frameXY.x),
        y: Math.round(elementRef.y() - frameXY.y),
      });
    },
  };

  return (
    <>
      {element.type === "Rectangle" && (
        <Rect {...commonProps} ref={setElementRef} />
      )}
      {element.type === "Text" && (
        <ElementText
          element={element}
          props={commonProps}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          elementRef={elementRef as Konva.Text}
          setElementRef={setElementRef}
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
            if (Math.abs(newBox.width) < 2 || Math.abs(newBox.height) < 2) {
              return oldBox;
            }
            return newBox;
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
          }}
          enabledAnchors={isEditing ? [] : undefined}
        />
      )}
      {element.beingDrawn && (
        <Rect
          x={element.x + frameXY.x}
          y={element.y + frameXY.y}
          width={element.width}
          height={element.height}
          stroke="#70AFDC"
          strokeWidth={1}
          dash={[5, 10]}
        />
      )}
    </>
  );
}
