"use client";

import { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import { QRCodeSVG } from "qrcode.react";

interface DesignerProps {
  template: File;
  initialSettings?: {
    textX: number;
    textY: number;
    fontSize: number;
    fontColor: string;
    qrX: number;
    qrY: number;
    qrSize: number;
    qrTransparent: boolean;
  };
  onClose: () => void;
  onSave: (settings: {
    textX: number;
    textY: number;
    fontSize: number;
    fontColor: string;
    qrX: number;
    qrY: number;
    qrSize: number;
    qrTransparent: boolean;
  }) => void;
}

export default function CertificateDesignerModal({
  template,
  initialSettings,
  onClose,
  onSave,
}: DesignerProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [textPos, setTextPos] = useState({
    x: initialSettings?.textX || 120,
    y: initialSettings?.textY || 120,
  });

  const [qrPos, setQrPos] = useState({
    x: initialSettings?.qrX || 350,
    y: initialSettings?.qrY || 280,
  });

  const [fontSize, setFontSize] = useState(initialSettings?.fontSize || 28);
  const [fontColor, setFontColor] = useState(initialSettings?.fontColor || "#000000");

  const [qrSize, setQrSize] = useState(initialSettings?.qrSize || 90);
  const [qrTransparent, setQrTransparent] = useState(initialSettings?.qrTransparent || false);

  const [snapToGrid, setSnapToGrid] = useState(false);
  const gridSize = 10;

  // Snap-to-grid helper
  const snap = (pos: number) => (snapToGrid ? Math.round(pos / gridSize) * gridSize : pos);

  // Alignment function
  const alignElement = (type: "text" | "qr", alignment: string) => {
    if (!canvasRef.current) return;
    const { width: cw, height: ch } = canvasRef.current.getBoundingClientRect();

    const elementRef = type === "text" ? textRef.current : qrRef.current;
    const { width: ew, height: eh } = elementRef!.getBoundingClientRect();

    let x = type === "text" ? textPos.x : qrPos.x;
    let y = type === "text" ? textPos.y : qrPos.y;

    switch (alignment) {
      case "left":
        x = 0;
        break;
      case "center":
        x = (cw - ew) / 2;
        break;
      case "right":
        x = cw - ew;
        break;
      case "top":
        y = 0;
        break;
      case "middle":
        y = (ch - eh) / 2;
        break;
      case "bottom":
        y = ch - eh;
        break;
    }

    if (type === "text") setTextPos({ x, y });
    else setQrPos({ x, y });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-[1000px] max-w-full rounded-xl shadow-xl flex">
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative flex-1 border rounded-l-xl overflow-hidden bg-gray-100 h-[600px]"
        >
          <img
            src={URL.createObjectURL(template)}
            alt="Template"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Draggable Text */}
          <Draggable
            nodeRef={textRef}
            bounds="parent"
            position={textPos}
            grid={snapToGrid ? [gridSize, gridSize] : undefined}
            onStop={(e, data) => setTextPos({ x: snap(data.x), y: snap(data.y) })}
          >
            <div
              ref={textRef}
              className="absolute cursor-move font-bold select-none"
              style={{
                fontSize,
                color: fontColor,
                textShadow: "0px 0px 3px rgba(0,0,0,0.3)",
              }}
            >
              Sample Text
            </div>
          </Draggable>

          {/* Draggable QR */}
          <Draggable
            nodeRef={qrRef}
            bounds="parent"
            position={qrPos}
            grid={snapToGrid ? [gridSize, gridSize] : undefined}
            onStop={(e, data) => setQrPos({ x: snap(data.x), y: snap(data.y) })}
          >
            <div ref={qrRef} className="absolute cursor-move">
              <QRCodeSVG
                value="https://example.com/certificate"
                width={qrSize}
                height={qrSize}
                bgColor={qrTransparent ? "transparent" : "#ffffff"}
              />
            </div>
          </Draggable>
        </div>

        {/* Controls */}
        <div className="w-[300px] p-5 space-y-4 bg-gray-50 border-l rounded-r-xl overflow-y-auto">
          <h3 className="text-lg font-bold mb-2">Controls</h3>

          {/* Font Size */}
          <div>
            <label className="font-semibold">Text Font Size</label>
            <input
              type="range"
              min={10}
              max={100}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full border rounded-md px-2 py-1 mt-1"
            />
          </div>

          {/* Font Color */}
          <div>
            <label className="font-semibold">Text Color</label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-full h-[35px] border rounded-md cursor-pointer"
            />
          </div>

          {/* QR Size */}
          <div>
            <label className="font-semibold">QR Size</label>
            <input
              type="range"
              min={50}
              max={300}
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full border rounded-md px-2 py-1 mt-1"
            />
          </div>

          {/* QR Transparent */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={qrTransparent}
              onChange={(e) => setQrTransparent(e.target.checked)}
            />
            <label className="font-semibold">QR Transparent Background</label>
          </div>

          {/* Snap to Grid */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
            />
            <label className="font-semibold">Snap to Grid</label>
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <label className="font-semibold">Text Alignment</label>
            <div className="flex flex-wrap gap-2">
              {["left", "center", "right"].map((a) => (
                <button
                  key={a}
                  className="px-2 py-1 border rounded hover:bg-gray-200"
                  onClick={() => alignElement("text", a)}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {["top", "middle", "bottom"].map((a) => (
                <button
                  key={a}
                  className="px-2 py-1 border rounded hover:bg-gray-200"
                  onClick={() => alignElement("text", a)}
                >
                  {a}
                </button>
              ))}
            </div>

            <label className="font-semibold mt-3">QR Alignment</label>
            <div className="flex flex-wrap gap-2">
              {["left", "center", "right"].map((a) => (
                <button
                  key={a}
                  className="px-2 py-1 border rounded hover:bg-gray-200"
                  onClick={() => alignElement("qr", a)}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {["top", "middle", "bottom"].map((a) => (
                <button
                  key={a}
                  className="px-2 py-1 border rounded hover:bg-gray-200"
                  onClick={() => alignElement("qr", a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Save / Close */}
          <div className="flex justify-between mt-5">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button
              onClick={() =>
                onSave({
                  textX: textPos.x,
                  textY: textPos.y,
                  fontSize,
                  fontColor,
                  qrX: qrPos.x,
                  qrY: qrPos.y,
                  qrSize,
                  qrTransparent,
                })
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
