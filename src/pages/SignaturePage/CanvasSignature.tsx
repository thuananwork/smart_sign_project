// src/pages/SignaturePage/CanvasSignature.tsx
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
} from "react";

/** Public APIs để SignaturePage gọi */
export type CanvasSignatureHandle = {
    toDataURL: () => string | null;
    clear: () => void;
};

interface Props {
    width?: number;        // bề rộng hiển thị (CSS px)
    height?: number;       // bề cao hiển thị (CSS px)
    lineWidth?: number;
    strokeStyle?: string;
    onSave?: (dataUrl: string) => void; // callback sau mỗi lần nhả bút
}

const CanvasSignature = forwardRef<CanvasSignatureHandle, Props>(
    (
        {
            width = 560,
            height = 240,
            lineWidth = 2,
            strokeStyle = "#000",
            onSave,
        },
        ref
    ) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const drawingRef = useRef(false);
        const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

        useImperativeHandle(
            ref,
            () => ({
                toDataURL: () => canvasRef.current?.toDataURL() ?? null,
                clear: () => {
                    const c = canvasRef.current;
                    const ctx = ctxRef.current;
                    if (!c || !ctx) return;
                    ctx.clearRect(0, 0, c.width, c.height);
                    onSave?.(c.toDataURL());
                },
            }),
            [onSave]
        );

        // Set up kích thước thực (pixel) theo DPR và scale context
        useLayoutEffect(() => {
            const c = canvasRef.current;
            if (!c) return;

            // Kích thước hiển thị (CSS px)
            c.style.width = `${width}px`;
            c.style.height = `${height}px`;

            // Kích thước pixel thực theo DPR
            const dpr = window.devicePixelRatio || 1;
            c.width = Math.round(width * dpr);
            c.height = Math.round(height * dpr);

            const ctx = c.getContext("2d");
            if (!ctx) return;

            // Reset & scale theo DPR để vẽ bằng CSS pixel
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = strokeStyle;

            ctxRef.current = ctx;

            // Ngăn trang cuộn khi ký trên mobile
            c.style.touchAction = "none";
        }, [width, height, lineWidth, strokeStyle]);

        useEffect(() => {
            const c = canvasRef.current;
            const ctx = ctxRef.current;
            if (!c || !ctx) return;

            const getPos = (e: PointerEvent) => {
                const rect = c.getBoundingClientRect();
                // Vì đã scale context theo DPR, tọa độ CSS pixel là chính xác
                return { x: e.clientX - rect.left, y: e.clientY - rect.top };
            };

            const down = (e: PointerEvent) => {
                e.preventDefault();
                c.setPointerCapture(e.pointerId);
                drawingRef.current = true;
                const { x, y } = getPos(e);
                ctx.beginPath();
                ctx.moveTo(x, y);
            };
            const move = (e: PointerEvent) => {
                if (!drawingRef.current) return;
                const { x, y } = getPos(e);
                ctx.lineTo(x, y);
                ctx.stroke();
            };
            const up = (e: PointerEvent) => {
                if (!drawingRef.current) return;
                drawingRef.current = false;
                try {
                    c.releasePointerCapture(e.pointerId);
                } catch { }
                onSave?.(c.toDataURL());
            };
            const leave = () => {
                drawingRef.current = false;
            };

            c.addEventListener("pointerdown", down);
            c.addEventListener("pointermove", move);
            c.addEventListener("pointerup", up);
            c.addEventListener("pointerleave", leave);
            c.addEventListener("pointercancel", leave);

            return () => {
                c.removeEventListener("pointerdown", down);
                c.removeEventListener("pointermove", move);
                c.removeEventListener("pointerup", up);
                c.removeEventListener("pointerleave", leave);
                c.removeEventListener("pointercancel", leave);
            };
        }, [onSave]);

        return (
            <div
                className="canvas-wrap"
                style={{
                    background: "#fff",
                    border: "1px solid #e7ecf7",
                    borderRadius: 12,
                    padding: 8,
                }}
            >
                <canvas ref={canvasRef} />
            </div>
        );
    }
);

export default CanvasSignature;
