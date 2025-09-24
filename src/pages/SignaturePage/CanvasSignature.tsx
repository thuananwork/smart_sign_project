import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef } from "react";

export interface CanvasSignatureHandle {
  clear: () => void;
  toDataURL: () => string | null;
}

interface CanvasSignatureProps {
  onSave?: (dataUrl: string) => void;
  width?: number;      // CSS px
  height?: number;     // CSS px
  strokeStyle?: string;
  lineWidth?: number;  // theo CSS px
}

const CanvasSignature = React.forwardRef<CanvasSignatureHandle, CanvasSignatureProps>(
  ({ onSave, width = 560, height = 240, strokeStyle = "#000000", lineWidth = 2 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);

    useImperativeHandle(ref, () => ({
      clear() {
        const c = canvasRef.current;
        const ctx = c?.getContext("2d");
        if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
      },
      toDataURL() {
        const c = canvasRef.current;
        return c ? c.toDataURL("image/png") : null;
      },
    }));

    // ✅ Render ở độ phân giải cao (DPR * OVERSAMPLE) để luôn nét
    useLayoutEffect(() => {
      const c = canvasRef.current;
      if (!c) return;

      const DPR = window.devicePixelRatio || 1;
      const OVERSAMPLE = 3;                       // << bạn có thể nâng lên 4 nếu muốn nét hơn
      const scale = DPR * OVERSAMPLE;

      // kích thước hiển thị (CSS px — KHÔNG đổi)
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;

      // kích thước bitmap thật (device px — RẤT LỚN)
      c.width  = Math.round(width  * scale);
      c.height = Math.round(height * scale);

      const ctx = c.getContext("2d");
      if (!ctx) return;

      // Scale context để vẽ theo đơn vị CSS px
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(scale, scale);

      ctx.lineWidth = lineWidth;                  // lineWidth giữ theo CSS px
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = strokeStyle;

      // làm mượt khi có image draw lại
      (ctx as any).imageSmoothingEnabled = true;
      (ctx as any).imageSmoothingQuality = "high";

      (c.style as any).touchAction = "none";
    }, [width, height, lineWidth, strokeStyle]);

    useEffect(() => {
      const c = canvasRef.current!;
      const ctx = c.getContext("2d")!;
      const rect = () => c.getBoundingClientRect();
      const pos = (e: PointerEvent) => ({ x: e.clientX - rect().left, y: e.clientY - rect().top });

      const down = (e: PointerEvent) => {
        e.preventDefault();
        c.setPointerCapture(e.pointerId);
        isDrawing.current = true;
        const { x, y } = pos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
      };
      const move = (e: PointerEvent) => {
        if (!isDrawing.current) return;
        const { x, y } = pos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
      };
      const up = (e: PointerEvent) => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        try { c.releasePointerCapture(e.pointerId); } catch {}
        onSave?.(c.toDataURL("image/png"));
      };

      c.addEventListener("pointerdown", down);
      c.addEventListener("pointermove", move);
      c.addEventListener("pointerup", up);
      c.addEventListener("pointerleave", up);
      c.addEventListener("pointercancel", up);
      return () => {
        c.removeEventListener("pointerdown", down);
        c.removeEventListener("pointermove", move);
        c.removeEventListener("pointerup", up);
        c.removeEventListener("pointerleave", up);
        c.removeEventListener("pointercancel", up);
      };
    }, [onSave]);

    return (
      <div style={{ width: "100%" }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            border: "1px solid #e2e8f6",
            borderRadius: 10,
            background: "#fff",
            margin: "0 auto",
          }}
        />
      </div>
    );
  }
);

CanvasSignature.displayName = "CanvasSignature";
export default CanvasSignature;
