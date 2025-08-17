// src/pages/SignaturePage/SignaturePage.tsx
import { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import BottomBar from "../../components/Footer/BottomBar/BottomBar";
import DocumentPreview from "./DocumentPreview";
import CanvasSignature from "./CanvasSignature";
import type { CanvasSignatureHandle } from "./CanvasSignature"; // type-only import ✅
import SavedSignatures from "./SavedSignatures";
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
} from "react-icons/fi";
import "../../styles/Background.css";
import "./SignaturePage.css";

type PreviewFile = { url: string; name: string; type: string };
type Panel = "draw" | "saved" | "tools" | null;

export default function SignaturePage() {
    const [file, setFile] = useState<PreviewFile | null>(null);

    // Chữ ký
    const [savedSignature, setSavedSignature] = useState<string | null>(
        localStorage.getItem("savedSignature") || null
    );
    const [selectedSignature, setSelectedSignature] = useState<string | null>(savedSignature);
    const [showOnDocument, setShowOnDocument] = useState<boolean>(false);

    // Màu nét ký tay (đen, xanh dương, đỏ)
    const [drawColor, setDrawColor] = useState<string>("#000000");

    // ref canvas để lấy ảnh khi bấm "Tạo"
    const sigRef = useRef<CanvasSignatureHandle>(null);

    // Upload dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Tool modals
    const [openPanel, setOpenPanel] = useState<Panel>(null);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    // Thu hồi objectURL khi đổi file
    useEffect(() => {
        return () => {
            if (file?.url) URL.revokeObjectURL(file.url);
        };
    }, [file?.url]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const f = event.target.files?.[0];
        if (!f) return;
        if (file?.url) URL.revokeObjectURL(file.url);
        const url = URL.createObjectURL(f);
        setFile({ url, name: f.name, type: f.type });
        event.target.value = "";
    };

    const openFileDialog = (e?: React.MouseEvent) => {
        e?.stopPropagation?.();
        fileInputRef.current?.click();
    };

    const handleSourceSelect = (source: string) => {
        if (source === "device") openFileDialog();
        else if (source === "drive") alert("Tải từ Google Drive (cần tích hợp API).");
        else if (source === "onedrive") alert("Tải từ OneDrive (cần tích hợp API).");
        setIsDropdownOpen(false);
    };

    const handleDownload = () => {
        if (!file) return;
        const a = document.createElement("a");
        a.href = file.url;
        a.download = file.name || "document";
        a.click();
    };

    /** Khi bấm “Tạo”: lưu chữ ký + chọn + hiển thị ngay trên tài liệu */
    const handleCreateFromCanvas = () => {
        const data = sigRef.current?.toDataURL();
        if (data) {
            setSavedSignature(data);
            localStorage.setItem("savedSignature", data);
            setSelectedSignature(data);
            setShowOnDocument(true);
            setOpenPanel(null);
        }
    };

    return (
        <div className="background-root">
            <Header
                userName="Nguyễn Thuận An"
                avatarUrl="https://randomuser.me/api/portraits/men/34.jpg"
                onLogout={() => (window.location.href = "/")}
            />

            {/* TOP BAR */}
            <div className="sign-topbar">
                <button className="btn back-btn" onClick={() => window.history.back()} title="Quay lại">
                    <FiArrowLeft />
                    <span>Quay lại</span>
                </button>

                <div className="file-meta">
                    <div className="file-name">{file ? file.name : "Chưa chọn tài liệu"}</div>
                    {file && <div className="file-cloud">Đã tải lên SmartSign</div>}
                </div>

                <div className="topbar-actions">
                    {!file && (
                        <div className="btn-group" ref={dropdownRef}>
                            <button className="btn primary" onClick={openFileDialog}>
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
                                <div className="split-menu" onClick={(e) => e.stopPropagation()}>
                                    <div className="split-item" onClick={() => handleSourceSelect("device")}>
                                        From Device
                                    </div>
                                    <div className="split-item" onClick={() => handleSourceSelect("drive")}>
                                        From Drive
                                    </div>
                                    <div className="split-item" onClick={() => handleSourceSelect("onedrive")}>
                                        From Onedrive
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {file && (
                        <>
                            <button className="btn ghost" onClick={handleDownload}>
                                <FiDownload /> Tải xuống
                            </button>
                            <button className="btn success" onClick={() => alert("Xác nhận & gửi (demo).")}>
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
                        <div className="hero-sub">Hỗ trợ PDF, ảnh (PNG/JPG), Word, Excel, PowerPoint</div>
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
                        {/* Thanh công cụ */}
                        <div className="rail-group">
                            <button
                                className={`rail-btn ${openPanel === "draw" ? "active" : ""}`}
                                title="Ký tay"
                                onClick={() => setOpenPanel(openPanel === "draw" ? null : "draw")}
                            >
                                <FiEdit />
                            </button>

                            <button
                                className={`rail-btn ${openPanel === "saved" ? "active" : ""}`}
                                title="Chữ ký đã lưu"
                                onClick={() => setOpenPanel(openPanel === "saved" ? null : "saved")}
                            >
                                <FiImage />
                            </button>

                            <button
                                className={`rail-btn ${openPanel === "tools" ? "active" : ""}`}
                                title="Công cụ"
                                onClick={() => setOpenPanel(openPanel === "tools" ? null : "tools")}
                            >
                                <FiTool />
                            </button>

                            <button className="rail-btn" title="Nền / Lưới căn chỉnh">
                                <FiGrid />
                            </button>
                        </div>

                        {/* Thumbnails (demo 1 trang) */}
                        <div className="thumbs">
                            <div className="thumb" title={file?.name}>
                                {file &&
                                    (file.type?.startsWith("image/") ||
                                        file.name.toLowerCase().match(/\.(png|jpe?g|gif|webp)$/)) ? (
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
                    <main className="viewer-area">
                        <DocumentPreview
                            file={file}
                            signatureData={showOnDocument ? selectedSignature : null}
                        // maxWidth="840px"   // <= có thể mở comment để khống chế bề ngang
                        // maxHeight="600px" // <= có thể mở comment để khống chế bề dọc
                        />
                    </main>
                </div>
            )}

            {/* MODALS mở từ rail-group */}
            {openPanel && (
                <div className="tool-modal" onClick={() => setOpenPanel(null)}>
                    <div className="tool-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="tool-modal-close" onClick={() => setOpenPanel(null)}>
                            <FiX />
                        </button>

                        {openPanel === "draw" && (
                            <>
                                <div className="tool-title">Chữ ký</div>

                                {/* ==== Chọn màu nét (đen / xanh dương / đỏ) ==== */}
                                <div className="color-row">
                                    <span className="color-label">Màu nét:</span>

                                    <button
                                        className={`color-swatch ${drawColor === "#000000" ? "active" : ""}`}
                                        onClick={() => setDrawColor("#000000")}
                                        title="Đen"
                                        aria-label="Đen"
                                    >
                                        <span className="color-swatch-inner" style={{ background: "#000000" }} />
                                    </button>

                                    <button
                                        className={`color-swatch ${drawColor === "#1e6cff" ? "active" : ""}`}
                                        onClick={() => setDrawColor("#1e6cff")}
                                        title="Xanh dương"
                                        aria-label="Xanh dương"
                                    >
                                        <span className="color-swatch-inner" style={{ background: "#1e6cff" }} />
                                    </button>

                                    <button
                                        className={`color-swatch ${drawColor === "#e53935" ? "active" : ""}`}
                                        onClick={() => setDrawColor("#e53935")}
                                        title="Đỏ"
                                        aria-label="Đỏ"
                                    >
                                        <span className="color-swatch-inner" style={{ background: "#e53935" }} />
                                    </button>
                                </div>

                                <CanvasSignature
                                    ref={sigRef}
                                    width={560}
                                    height={240}
                                    lineWidth={2}
                                    strokeStyle={drawColor}
                                    onSave={() => {
                                        /* không auto push */
                                    }}
                                />

                                <div className="action-buttons" style={{ justifyContent: "space-between" }}>
                                    <button onClick={() => sigRef.current?.clear()}>Xóa</button>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => setOpenPanel(null)}>Hủy</button>
                                        <button onClick={handleCreateFromCanvas}>Tạo</button>
                                    </div>
                                </div>
                            </>
                        )}

                        {openPanel === "saved" && (
                            <>
                                <div className="tool-title">Chữ ký</div>
                                {savedSignature ? (
                                    <div style={{ display: "grid", gap: 8 }}>
                                        <img
                                            src={savedSignature}
                                            alt="saved-signature"
                                            style={{
                                                maxWidth: 260,
                                                border: "1px solid #e7ecf7",
                                                borderRadius: 8,
                                                padding: 8,
                                                background: "#fff",
                                            }}
                                        />
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedSignature(savedSignature);
                                                    setShowOnDocument(true);
                                                    setOpenPanel(null);
                                                }}
                                            >
                                                Dùng trên tài liệu
                                            </button>
                                            <button onClick={() => setOpenPanel("draw")}>Tạo chữ ký mới</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ color: "#6a7384" }}>
                                        Chưa có chữ ký. Hãy bấm <b>Tạo chữ ký mới</b>.
                                        <div style={{ marginTop: 8 }}>
                                            <button onClick={() => setOpenPanel("draw")}>Tạo chữ ký mới</button>
                                        </div>
                                    </div>
                                )}
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
