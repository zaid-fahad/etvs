"use client";

import { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import { QRCodeSVG } from "qrcode.react";

interface DesignerProps {
  templateURL: string;
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
  onSave: (settings: any) => void;
}

export default function CertificateDesignerModal({
  templateURL,
  initialSettings,
  onClose,
  onSave,
}: DesignerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [display, setDisplay] = useState({ w: 0, h: 0 });

  // POSITIONS
  const [text, setText] = useState({
    x: initialSettings?.textX ?? null,
    y: initialSettings?.textY ?? null,
  });

  const [qr, setQr] = useState({
    x: initialSettings?.qrX ?? null,
    y: initialSettings?.qrY ?? null,
  });

  // STYLE VALUES
  const [fontSize, setFontSize] = useState(initialSettings?.fontSize || 28);
  const [fontColor, setFontColor] = useState(initialSettings?.fontColor || "#000");
  const [qrSize, setQrSize] = useState(initialSettings?.qrSize || 120);
  const [qrTransparent, setQrTransparent] = useState(
    initialSettings?.qrTransparent || false
  );

  const [snapGrid, setSnapGrid] = useState(false);
  const snap = (n: number) =>
    snapGrid ? Math.round(n / 10) * 10 : n;

  // IMAGE LOADED → GET REAL & DISPLAY SIZE
  useEffect(() => {
    if (!imgRef.current) return;

    const updateSize = () => {
      const img = imgRef.current!;
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });

      const rect = canvasRef.current!.getBoundingClientRect();
      const ratio = img.naturalWidth / img.naturalHeight;

      let width = rect.width;
      let height = width / ratio;

      if (height > rect.height) {
        height = rect.height;
        width = height * ratio;
      }

      setDisplay({ w: width, h: height });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // CENTER ELEMENTS IF NOT SET
  useEffect(() => {
    if (!display.w) return;

    if (text.x === null || text.y === null) {
      setText({ x: display.w / 2 - 150, y: display.h / 2 - 20 });
    }
    if (qr.x === null || qr.y === null) {
      setQr({ x: display.w / 2 - 60, y: display.h / 2 + 40 });
    }
  }, [display.w]);

  // SAVE TRANSFORMED VALUES
  const handleSave = () => {
    const scaleX = natural.w / display.w;
    const scaleY = natural.h / display.h;

    onSave({
      textX: Math.round(text.x! * scaleX),
      textY: Math.round(text.y! * scaleY),
      fontSize: Math.round(fontSize * scaleY),
      fontColor,
      qrX: Math.round(qr.x! * scaleX),
      qrY: Math.round(qr.y! * scaleY),
      qrSize: Math.round(qrSize * scaleX),
      qrTransparent,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl flex w-[1100px] max-w-full h-[650px] overflow-hidden">

        {/* LEFT CANVAS */}
        <div className="flex-1 bg-gray-200 relative flex items-center justify-center overflow-hidden"
             ref={canvasRef}>
          
          <div
            className="relative"
            style={{ width: display.w, height: display.h }}
          >

            {/* TEMPLATE IMAGE */}
            <img
              ref={imgRef}
              src={templateURL}
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* TEXT */}
            {text.x !== null && (
              <Draggable
                bounds="parent"
                nodeRef={textRef}
                position={{ x: text.x, y: text.y }}
                onDrag={(e, d) => setText({ x: snap(d.x), y: snap(d.y) })}
              >
                <div
                  ref={textRef}
                  className="absolute cursor-move font-semibold select-none"
                  style={{ fontSize, color: fontColor }}
                >
                  Sample Name
                </div>
              </Draggable>
            )}

            {/* QR */}
            {qr.x !== null && (
              <Draggable
                bounds="parent"
                nodeRef={qrRef}
                position={{ x: qr.x, y: qr.y }}
                onDrag={(e, d) => setQr({ x: snap(d.x), y: snap(d.y) })}
              >
                <div ref={qrRef} className="absolute cursor-move">
                  <QRCodeSVG
                    value="sample"
                    width={qrSize}
                    height={qrSize}
                    bgColor={qrTransparent ? "transparent" : "#fff"}
                  />
                </div>
              </Draggable>
            )}

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[320px] bg-gray-50 border-l p-5 space-y-5 overflow-y-auto">

          <h2 className="text-xl font-bold">Designer Controls</h2>

          {/* SLIDERS */}
          <div>
            <label className="font-semibold">Text Size</label>
            <input type="range" min={10} max={120} value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full" />
          </div>

          <div>
            <label className="font-semibold">Text Color</label>
            <input type="color" className="w-full h-10"
              value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
          </div>

          <div>
            <label className="font-semibold">QR Size</label>
            <input type="range" min={40} max={300} value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="w-full" />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={qrTransparent}
              onChange={(e) => setQrTransparent(e.target.checked)} />
            Transparent QR Background
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={snapGrid}
              onChange={(e) => setSnapGrid(e.target.checked)} />
            Snap to 10px Grid
          </label>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700"
            >
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
