// src/pages/SignaturePage/SignaturePage.tsx
import { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import BottomBar from "../../components/Footer/BottomBar/BottomBar";
import DocumentPreview from "./DocumentPreview";
import CanvasSignature from "./CanvasSignature";
import type { CanvasSignatureHandle } from "./CanvasSignature";
import SignatureTools from "./SignatureTools";
import {
    FiArrowLeft,
    FiDownload,
    FiCheck,
    FiUpload,
    FiGrid,
    FiEdit,
    FiTool,
    FiImage,
    FiX,
    FiFileText,
    FiSave,
    FiTrash2,
} from "react-icons/fi";
import "../../styles/Background.css";
import "./SignaturePage.css";

type PreviewFile = { url: string; name: string; type: string };
type Panel = "draw" | "saved" | "tools" | null;

/** Kích thước vùng làm việc (canvas & upload) — PHÓNG TO để không “nhỏ” như trước */
const SIG_WORK_W = 820; // px
const SIG_WORK_H = 420; // px

export default function SignaturePage() {
    const [sigTab, setSigTab] = useState<"draw" | "upload">("draw");
    const [sigSelected, setSigSelected] = useState(false);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const DEFAULT_SIG_W = 220;
    const [file, setFile] = useState<PreviewFile | null>(null);
    const [selectedSignature, setSelectedSignature] = useState<string | null>(
        null
    );
    const [savedSignature, setSavedSignature] = useState<string | null>(
        localStorage.getItem("savedSignature") || null
    );
    const [showOnDocument, setShowOnDocument] = useState<boolean>(false);
    const [drawColor, setDrawColor] = useState<string>("#000000");
    const [drawLineWidth, setDrawLineWidth] = useState<number>(2);
    const [saving, setSaving] = useState(false);
    const sigRef = useRef<CanvasSignatureHandle>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openPanel, setOpenPanel] = useState<Panel>(null);
    const viewerAreaRef = useRef<HTMLDivElement>(null);
    const docWrapRef = useRef<HTMLDivElement>(null);
    const sigImgRef = useRef<HTMLImageElement>(null);
    const [sigPos, setSigPos] = useState({ x: 100, y: 100 });
    const [sigWidth, setSigWidth] = useState(DEFAULT_SIG_W);
    const [sigAspect, setSigAspect] = useState(SIG_WORK_W / SIG_WORK_H);
    const natSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const [dragging, setDragging] = useState(false);
    const dragOffset = useRef({ dx: 0, dy: 0 });

    type Corner = "tl" | "tr" | "bl" | "br";
    const [resizing, setResizing] = useState<Corner | null>(null);
    const resizeStart = useRef({
        mouseX: 0,
        mouseY: 0,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
    });

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    useEffect(() => {
        return () => {
            if (file?.url) URL.revokeObjectURL(file.url);
        };
    }, [file?.url]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const el = document.activeElement as HTMLElement | null;
            const isTyping =
                el &&
                (el.tagName === "INPUT" ||
                    el.tagName === "TEXTAREA" ||
                    el.isContentEditable);

            if (openPanel || isTyping) return;
            if (!sigSelected || !showOnDocument || !selectedSignature) return;

            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                setSelectedSignature(null);
                setShowOnDocument(false);
                setSigSelected(false);
            }
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [sigSelected, showOnDocument, selectedSignature, openPanel]);

    useEffect(() => {
        const savedFile = localStorage.getItem("signaturePageFileMeta");
        const savedBase64 = localStorage.getItem("signaturePageFileBase64");
        if (savedFile && savedBase64) {
            const { name, type } = JSON.parse(savedFile);
            setFile({ url: savedBase64, name, type });
        }
    }, []);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const f = event.target.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
            // Save base64 string to localStorage
            localStorage.setItem(
                "signaturePageFileBase64",
                reader.result as string
            );
            localStorage.setItem(
                "signaturePageFileMeta",
                JSON.stringify({ name: f.name, type: f.type })
            );
            setFile({
                url: reader.result as string,
                name: f.name,
                type: f.type,
            });
        };
        reader.readAsDataURL(f); // This creates a base64 data URL
        event.target.value = "";
    };

    const openFileDialog = (e?: React.MouseEvent) => {
        e?.stopPropagation?.();
        fileInputRef.current?.click();
    };

    const handleSourceSelect = (source: string) => {
        if (source === "device") openFileDialog();
        else if (source === "drive")
            alert("Tải từ Google Drive (cần tích hợp API).");
        else if (source === "onedrive")
            alert("Tải từ OneDrive (cần tích hợp API).");
        setIsDropdownOpen(false);
    };

    const handleDownload = () => {
        if (!file) return;
        const a = document.createElement("a");
        a.href = file.url;
        a.download = file.name || "document";
        a.click();
    };

    // ===== Helpers (ảnh/chữ ký) =====
    async function trimTransparentPng(
        dataUrl: string,
        padding = 6
    ): Promise<string> {
        const img = new Image();
        img.src = dataUrl;
        await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej(new Error("load image error"));
        });

        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h).data;
        let top = h,
            left = w,
            right = 0,
            bottom = 0;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                const a = imgData[idx + 3];
                if (a > 5) {
                    if (x < left) left = x;
                    if (x > right) right = x;
                    if (y < top) top = y;
                    if (y > bottom) bottom = y;
                }
            }
        }
        if (right < left || bottom < top) return dataUrl;

        left = Math.max(0, left - padding);
        top = Math.max(0, top - padding);
        right = Math.min(w - 1, right + padding);
        bottom = Math.min(h - 1, bottom + padding);

        const newW = right - left + 1;
        const newH = bottom - top + 1;

        const c2 = document.createElement("canvas");
        c2.width = newW;
        c2.height = newH;
        c2.getContext("2d")!.drawImage(
            c,
            left,
            top,
            newW,
            newH,
            0,
            0,
            newW,
            newH
        );
        return c2.toDataURL("image/png");
    }

    async function toBWSignature(dataUrl: string): Promise<string> {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = dataUrl;
        await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej(new Error("load image error"));
        });

        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const { data } = ctx.getImageData(0, 0, w, h);
        const WHITE_THR = 235;
        const BLACK_THR = 180;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i],
                g = data[i + 1],
                b = data[i + 2];
            const Y = 0.299 * r + 0.587 * g + 0.114 * b;
            if (Y >= WHITE_THR) {
                data[i + 3] = 0;
            } else {
                const t = Math.min(
                    1,
                    Math.max(0, (BLACK_THR - Y) / (BLACK_THR - WHITE_THR + 1))
                );
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = Math.max(data[i + 3], Math.round(255 * t));
            }
        }
        const out = new ImageData(data, w, h);
        ctx.putImageData(out, 0, 0);
        return c.toDataURL("image/png");
    }

    async function ensureTransparentPng(dataUrl: string): Promise<string> {
        if (dataUrl.startsWith("data:image/png")) {
            return await trimTransparentPng(dataUrl, 6);
        }
        const bw = await toBWSignature(dataUrl);
        return await trimTransparentPng(bw, 6);
    }

    // ===== Tạo chữ ký từ Canvas =====
    const handleCreateFromCanvas = async () => {
        const raw = sigRef.current?.toDataURL();
        if (!raw) return;

        const trimmed = await trimTransparentPng(raw, 6);

        setSelectedSignature(trimmed);
        setShowOnDocument(true);
        localStorage.setItem("savedSignature", trimmed);
        setSavedSignature(trimmed);

        const tmp = new Image();
        tmp.src = trimmed;
        await new Promise<void>((res) => (tmp.onload = () => res()));
        const natW = tmp.naturalWidth;
        const natH = tmp.naturalHeight;
        natSizeRef.current = { w: natW, h: natH };
        setSigAspect(natW / natH);

        const defaultW = Math.min(DEFAULT_SIG_W, natW);
        setSigWidth(defaultW);

        centerSignature(defaultW, defaultW / (natW / natH));
        setOpenPanel(null);
    };

    // ===== Upload tab =====
    const openUploadDialog = () => uploadInputRef.current?.click();

    const handleUploadFile = async (
        ev: React.ChangeEvent<HTMLInputElement>
    ) => {
        const f = ev.target.files?.[0];
        ev.target.value = "";
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            alert("Vui lòng chọn định dạng ảnh (PNG/JPG/WebP...)");
            return;
        }
        const url = URL.createObjectURL(f);
        const bw = await toBWSignature(url);
        URL.revokeObjectURL(url);

        const trimmed = await trimTransparentPng(bw, 6);
        setUploadPreview(trimmed);
    };

    const handleCreateFromUpload = async () => {
        if (!uploadPreview) return;

        setSelectedSignature(uploadPreview);
        setShowOnDocument(true);
        localStorage.setItem("savedSignature", uploadPreview);
        setSavedSignature(uploadPreview);

        const tmp = new Image();
        tmp.src = uploadPreview;
        await new Promise<void>((res) => (tmp.onload = () => res()));
        const natW = tmp.naturalWidth;
        const natH = tmp.naturalHeight;
        natSizeRef.current = { w: natW, h: natH };
        setSigAspect(natW / natH);

        const defaultW = Math.min(DEFAULT_SIG_W, natW);
        setSigWidth(defaultW);

        centerSignature(defaultW, defaultW / (natW / natH));
        setOpenPanel(null);
        setSigTab("draw");
        setUploadPreview(null);
    };

    const centerSignature = (w: number, h: number) => {
        const area = viewerAreaRef.current;
        const wrap = docWrapRef.current;
        if (area && wrap) {
            const centerX = (wrap.clientWidth - w) / 2;
            const visibleCenterY = area.scrollTop + area.clientHeight / 2;
            let newX = Math.max(0, centerX);
            let newY = Math.max(0, visibleCenterY - h / 2);
            newX = Math.min(newX, wrap.clientWidth - w);
            newY = Math.min(newY, wrap.scrollHeight - h);
            setSigPos({ x: newX, y: newY });
        }
    };

    const downloadDataUrl = (filename: string, dataUrl: string) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    const handleSaveSignature = async () => {
        if (!selectedSignature || saving) return;
        try {
            setSaving(true);
            const pngTransparent = await ensureTransparentPng(
                selectedSignature
            );
            localStorage.setItem("savedSignature", pngTransparent);
            setSavedSignature(pngTransparent);
            const ts = new Date();
            const fname = `signature_${ts.getFullYear()}-${String(
                ts.getMonth() + 1
            ).padStart(2, "0")}-${String(ts.getDate()).padStart(2, "0")}.png`;
            downloadDataUrl(fname, pngTransparent);
            alert("Đã lưu & tải chữ ký (PNG nền trong suốt)!");
        } catch (err) {
            console.error(err);
            alert("Lưu chữ ký không thành công. Thử lại nhé!");
        } finally {
            setSaving(false);
        }
    };

    // ===== Drag/Resize chữ ký =====
    const onSigPointerDown = (e: React.PointerEvent) => {
        if (!docWrapRef.current) return;
        const rect = docWrapRef.current.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        dragOffset.current = { dx: localX - sigPos.x, dy: localY - sigPos.y };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDragging(true);
        setSigSelected(true);
        e.preventDefault();
    };

    const onSigPointerMove = (e: React.PointerEvent) => {
        if (!dragging || !docWrapRef.current) return;
        const rect = docWrapRef.current.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;

        let nx = curX - dragOffset.current.dx;
        let ny = curY - dragOffset.current.dy;

        nx = Math.max(0, Math.min(nx, rect.width - sigWidth));
        const h = sigWidth / sigAspect;
        ny = Math.max(0, Math.min(ny, rect.height - h));

        setSigPos({ x: nx, y: ny });
    };

    const onSigPointerUp = (e: React.PointerEvent) => {
        setDragging(false);
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
    };

    const onResizeDown = (corner: Corner) => (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const startW = sigWidth;
        const startH = sigWidth / sigAspect;
        resizeStart.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            x: sigPos.x,
            y: sigPos.y,
            w: startW,
            h: startH,
        };
        setResizing(corner);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onWrapperPointerMove = (e: React.PointerEvent) => {
        if (!resizing || !docWrapRef.current) return;
        const rect = docWrapRef.current.getBoundingClientRect();
        const {
            mouseX,
            w: startW,
            h: startH,
            x: startX,
            y: startY,
        } = resizeStart.current;
        const dx = e.clientX - mouseX;

        let newW = startW;
        if (resizing === "tr" || resizing === "br") newW = startW + dx;
        if (resizing === "tl" || resizing === "bl") newW = startW - dx;

        const maxByWrap = rect.width;
        const maxByNatural = natSizeRef.current.w || Infinity;
        const maxW = Math.min(maxByWrap, maxByNatural);

        newW = Math.max(80, Math.min(newW, maxW));
        const newH = newW / sigAspect;

        let newX = startX;
        let newY = startY;
        if (resizing === "tl" || resizing === "bl")
            newX = startX + (startW - newW);
        if (resizing === "tl" || resizing === "tr")
            newY = startY + (startH - newH);

        newX = Math.max(0, Math.min(newX, rect.width - newW));
        newY = Math.max(0, Math.min(newY, rect.height - newH));

        setSigWidth(newW);
        setSigPos({ x: newX, y: newY });
    };

    const onWrapperPointerUp = (e: React.PointerEvent) => {
        if (!resizing) return;
        setResizing(null);
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
    };

    const onSigImgLoad = () => {
        const img = sigImgRef.current;
        if (!img) return;
        if (img.naturalWidth && img.naturalHeight) {
            natSizeRef.current = { w: img.naturalWidth, h: img.naturalHeight };
            setSigAspect(img.naturalWidth / img.naturalHeight);
            if (sigWidth > img.naturalWidth) setSigWidth(img.naturalWidth);
        }
    };

    return (
        <div className="background-root">
            <Header
                userName="Huỳnh Kiến Hào"
                avatarUrl={
                    localStorage.getItem("profileAvatarUrl") || undefined
                }
                onLogout={() => (window.location.href = "/")}
            />

            {/* TOP BAR */}
            <div className="sign-topbar">
                <button
                    className="btn back-btn"
                    onClick={() => window.history.back()}
                    title="Quay lại"
                >
                    <FiArrowLeft />
                    <span>Quay lại</span>
                </button>

                <div className="file-meta">
                    <div className="file-name">
                        {file ? file.name : "Chưa chọn tài liệu"}
                    </div>
                    {file && (
                        <div className="file-cloud">Đã tải lên SmartSign</div>
                    )}
                </div>

                <div className="topbar-actions">
                    {!file && (
                        <div className="btn-group" ref={dropdownRef}>
                            <button
                                className="btn primary"
                                onClick={openFileDialog}
                            >
                                <FiUpload /> Tải lên
                            </button>
                            <button
                                className="btn split"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDropdownOpen((v) => !v);
                                }}
                                aria-haspopup="menu"
                                aria-expanded={isDropdownOpen}
                            >
                                ▾
                            </button>

                            {isDropdownOpen && (
                                <div
                                    className="split-menu"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className="split-item"
                                        onClick={() =>
                                            handleSourceSelect("device")
                                        }
                                    >
                                        From Device
                                    </div>
                                    <div
                                        className="split-item"
                                        onClick={() =>
                                            handleSourceSelect("drive")
                                        }
                                    >
                                        From Drive
                                    </div>
                                    <div
                                        className="split-item"
                                        onClick={() =>
                                            handleSourceSelect("onedrive")
                                        }
                                    >
                                        From Onedrive
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {file && (
                        <>
                            {selectedSignature && (
                                <button
                                    className="btn ghost"
                                    onClick={handleSaveSignature}
                                    disabled={saving}
                                    title="Lưu chữ ký (PNG nền trong suốt) & tải về"
                                >
                                    <FiSave />{" "}
                                    {saving ? "Đang lưu..." : "Lưu chữ ký"}
                                </button>
                            )}
                            <button
                                className="btn ghost"
                                onClick={handleDownload}
                            >
                                <FiDownload /> Tải xuống
                            </button>
                            <button
                                className="btn success"
                                onClick={() => alert("Xác nhận & gửi (demo).")}
                            >
                                <FiCheck /> Hoàn thành
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* WORKSPACE */}
            {!file ? (
                <div className="upload-hero" onClick={openFileDialog}>
                    <div className="upload-hero-inner">
                        <div className="cloud-ico">☁️</div>
                        <div className="hero-title">Kéo thả file vào đây</div>
                        <div className="hero-sub">
                            Hỗ trợ PDF, ảnh (PNG/JPG), Word, Excel, PowerPoint
                        </div>
                        <div className="btn primary hero-btn">
                            <FiUpload /> Chọn file
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        id="upload-input"
                        type="file"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        onChange={handleFileUpload}
                        className="upload-input"
                    />
                </div>
            ) : (
                <div className="sign-shell">
                    {/* Sidebar trái */}
                    <aside className="left-rail">
                        <div className="rail-group">
                            <button
                                className={`rail-btn ${
                                    openPanel === "draw" ? "active" : ""
                                }`}
                                title="Ký tay / Tải chữ ký"
                                onClick={() => {
                                    setSigTab("draw");
                                    setOpenPanel(
                                        openPanel === "draw" ? null : "draw"
                                    );
                                }}
                            >
                                <FiEdit />
                            </button>

                            <button
                                className={`rail-btn ${
                                    openPanel === "saved" ? "active" : ""
                                }`}
                                title="Chữ ký đã lưu"
                                onClick={() =>
                                    setOpenPanel(
                                        openPanel === "saved" ? null : "saved"
                                    )
                                }
                            >
                                <FiImage />
                            </button>

                            <button
                                className={`rail-btn ${
                                    openPanel === "tools" ? "active" : ""
                                }`}
                                title="Công cụ"
                                onClick={() =>
                                    setOpenPanel(
                                        openPanel === "tools" ? null : "tools"
                                    )
                                }
                            >
                                <FiTool />
                            </button>

                            <button
                                className="rail-btn"
                                title="Nền / Lưới căn chỉnh"
                            >
                                <FiGrid />
                            </button>
                        </div>

                        {/* Thumbnails (demo 1 trang) */}
                        <div className="thumbs">
                            <div className="thumb" title={file?.name}>
                                {file &&
                                (file.type?.startsWith("image/") ||
                                    file.name
                                        .toLowerCase()
                                        .match(/\.(png|jpe?g|gif|webp)$/)) ? (
                                    <img src={file.url} alt="thumb" />
                                ) : (
                                    <div className="thumb-pdf">
                                        <FiFileText size={22} />
                                        <span>PDF</span>
                                    </div>
                                )}
                                <span className="thumb-num">1</span>
                            </div>
                        </div>
                    </aside>

                    {/* Viewer chính */}
                    <main className="viewer-area" ref={viewerAreaRef}>
                        <div
                            ref={docWrapRef}
                            style={{ position: "relative" }}
                            onPointerMove={onWrapperPointerMove}
                            onPointerUp={onWrapperPointerUp}
                            onMouseDown={(e) => {
                                if (e.target === e.currentTarget)
                                    setSigSelected(false);
                            }}
                        >
                            <DocumentPreview file={file} signatureData={null} />

                            {showOnDocument && selectedSignature && (
                                <div
                                    style={{
                                        position: "absolute",
                                        left: sigPos.x,
                                        top: sigPos.y,
                                        cursor: dragging ? "grabbing" : "grab",
                                        padding: 4,
                                        borderRadius: 6,
                                        userSelect: "none",
                                        outline: sigSelected
                                            ? "2px dashed #1e6cff"
                                            : "none",
                                        boxShadow: sigSelected
                                            ? "0 0 0 4px rgba(30,108,255,.12)"
                                            : "none",
                                    }}
                                    onPointerDown={onSigPointerDown}
                                    onPointerMove={onSigPointerMove}
                                    onPointerUp={onSigPointerUp}
                                >
                                    <img
                                        ref={sigImgRef}
                                        src={selectedSignature}
                                        alt="signature"
                                        onLoad={onSigImgLoad}
                                        style={{
                                            display: "block",
                                            width: sigWidth,
                                            height: "auto",
                                            pointerEvents: "auto",
                                            filter: dragging
                                                ? "drop-shadow(0 2px 8px rgba(0,0,0,.25))"
                                                : "none",
                                        }}
                                    />
                                    <span
                                        style={handleDotStyle("tl")}
                                        onPointerDown={onResizeDown("tl")}
                                    />
                                    <span
                                        style={handleDotStyle("tr")}
                                        onPointerDown={onResizeDown("tr")}
                                    />
                                    <span
                                        style={handleDotStyle("bl")}
                                        onPointerDown={onResizeDown("bl")}
                                    />
                                    <span
                                        style={handleDotStyle("br")}
                                        onPointerDown={onResizeDown("br")}
                                    />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            )}

            {/* ===== MODALS mở từ rail-group ===== */}
            {openPanel && (
                <div className="tool-modal" onClick={() => setOpenPanel(null)}>
                    <div
                        className="tool-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="tool-modal-close"
                            onClick={() => setOpenPanel(null)}
                        >
                            <FiX />
                        </button>

                        {openPanel === "draw" && (
                            <>
                                <div className="tool-title">Tạo chữ ký</div>

                                {/* Tabs */}
                                <div className="sig-tabs">
                                    <button
                                        className={`sig-tab ${
                                            sigTab === "draw" ? "active" : ""
                                        }`}
                                        onClick={() => setSigTab("draw")}
                                    >
                                        ✍️ Vẽ
                                    </button>
                                    <button
                                        className={`sig-tab ${
                                            sigTab === "upload" ? "active" : ""
                                        }`}
                                        onClick={() => setSigTab("upload")}
                                    >
                                        ⬆️ Tải lên
                                    </button>
                                </div>

                                {/* Body giữ kích thước lớn, chuyển tab mượt */}
                                <div className="tool-modal-body">
                                    {sigTab === "draw" ? (
                                        <>
                                            <div className="color-row">
                                                <span className="color-label">
                                                    Màu nét:
                                                </span>

                                                <button
                                                    className={`color-swatch ${
                                                        drawColor === "#000000"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setDrawColor("#000000")
                                                    }
                                                    title="Đen"
                                                    aria-label="Đen"
                                                >
                                                    <span
                                                        className="color-swatch-inner"
                                                        style={{
                                                            background:
                                                                "#000000",
                                                        }}
                                                    />
                                                </button>

                                                <button
                                                    className={`color-swatch ${
                                                        drawColor === "#1e6cff"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setDrawColor("#1e6cff")
                                                    }
                                                    title="Xanh dương"
                                                    aria-label="Xanh dương"
                                                >
                                                    <span
                                                        className="color-swatch-inner"
                                                        style={{
                                                            background:
                                                                "#1e6cff",
                                                        }}
                                                    />
                                                </button>

                                                <button
                                                    className={`color-swatch ${
                                                        drawColor === "#e53935"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setDrawColor("#e53935")
                                                    }
                                                    title="Đỏ"
                                                    aria-label="Đỏ"
                                                >
                                                    <span
                                                        className="color-swatch-inner"
                                                        style={{
                                                            background:
                                                                "#e53935",
                                                        }}
                                                    />
                                                </button>
                                            </div>

                                            <div style={{ marginBottom: 10 }}>
                                                <label>
                                                    Độ nét (độ dày nét):
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max="5"
                                                        step="0.5"
                                                        value={drawLineWidth}
                                                        onChange={(e) =>
                                                            setDrawLineWidth(
                                                                parseFloat(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                        style={{
                                                            margin: "0 8px",
                                                            verticalAlign:
                                                                "middle",
                                                        }}
                                                    />
                                                    <span>{drawLineWidth}</span>
                                                </label>
                                            </div>

                                            {/* === Canvas với khung LỚN === */}
                                            <div className="sig-work">
                                                <CanvasSignature
                                                    ref={sigRef}
                                                    width={SIG_WORK_W}
                                                    height={SIG_WORK_H}
                                                    lineWidth={drawLineWidth}
                                                    strokeStyle={drawColor}
                                                    onSave={() => {}}
                                                />
                                            </div>

                                            <div
                                                className="action-buttons"
                                                style={{
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        sigRef.current?.clear()
                                                    }
                                                >
                                                    Xóa
                                                </button>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setOpenPanel(null)
                                                        }
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleCreateFromCanvas
                                                        }
                                                    >
                                                        Tạo
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* === Upload với khung LỚN – không cắt ảnh === */}
                                            <div className="sig-work">
                                                <div className="upload-pane">
                                                    {!uploadPreview ? (
                                                        <div
                                                            className="upload-drop"
                                                            onClick={
                                                                openUploadDialog
                                                            }
                                                        >
                                                            <div className="upload-invite">
                                                                Bấm để chọn ảnh
                                                                chữ ký
                                                            </div>
                                                            <div className="upload-sub">
                                                                Chỉ nhận: PNG •
                                                                JPG • JPEG •
                                                                WEBP
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="upload-preview">
                                                            <img
                                                                src={
                                                                    uploadPreview
                                                                }
                                                                alt="preview-signature"
                                                            />
                                                        </div>
                                                    )}

                                                    <input
                                                        ref={uploadInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="upload-input"
                                                        onChange={
                                                            handleUploadFile
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div
                                                className="action-buttons"
                                                style={{
                                                    justifyContent:
                                                        "space-between",
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setUploadPreview(null);
                                                        openUploadDialog();
                                                    }}
                                                >
                                                    Chọn ảnh khác
                                                </button>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 8,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            setOpenPanel(null)
                                                        }
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleCreateFromUpload
                                                        }
                                                        disabled={
                                                            !uploadPreview
                                                        }
                                                    >
                                                        Tạo
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        {openPanel === "saved" && (
                            <>
                                <div className="tool-title">Chữ ký đã lưu</div>

                                <div className="sig-box">
                                    <div className="sig-preview">
                                        {savedSignature ? (
                                            <img
                                                src={savedSignature}
                                                alt="saved-signature"
                                            />
                                        ) : (
                                            <span className="sig-empty">
                                                Chưa có chữ ký đã lưu
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        className="sig-delete"
                                        onClick={() => {
                                            localStorage.removeItem(
                                                "savedSignature"
                                            );
                                            setSavedSignature(null);
                                        }}
                                        disabled={!savedSignature}
                                        title="Xóa chữ ký đã lưu"
                                    >
                                        <FiTrash2 size={24} />
                                    </button>
                                </div>

                                <div
                                    className="action-buttons"
                                    style={{ justifyContent: "space-between" }}
                                >
                                    <button
                                        onClick={() => {
                                            setSigTab("draw");
                                            setOpenPanel("draw");
                                        }}
                                    >
                                        Tạo chữ ký mới
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!savedSignature) return;
                                            setSelectedSignature(
                                                savedSignature
                                            );
                                            setShowOnDocument(true);
                                            setOpenPanel(null);
                                        }}
                                        disabled={!savedSignature}
                                    >
                                        Dùng trên tài liệu
                                    </button>
                                </div>
                            </>
                        )}

                        {openPanel === "tools" && (
                            <>
                                <div className="tool-title">Công cụ</div>
                                <SignatureTools />
                            </>
                        )}
                    </div>
                </div>
            )}

            <BottomBar />
        </div>
    );
}

/** 4 chấm/handle ở 4 góc – dùng để resize */
function handleDotStyle(pos: "tl" | "tr" | "bl" | "br"): React.CSSProperties {
    const base: React.CSSProperties = {
        position: "absolute",
        width: 12,
        height: 12,
        background: "#1e6cff",
        border: "2px solid #fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.25)",
        borderRadius: "50%",
    };
    if (pos === "tl")
        return { ...base, left: -6, top: -6, cursor: "nwse-resize" };
    if (pos === "tr")
        return { ...base, right: -6, top: -6, cursor: "nesw-resize" };
    if (pos === "bl")
        return { ...base, left: -6, bottom: -6, cursor: "nesw-resize" };
    return { ...base, right: -6, bottom: -6, cursor: "nwse-resize" };
}
