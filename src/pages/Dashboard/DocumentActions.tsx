import React, { useState, useRef, useEffect } from "react";
import type { DocumentItem } from "./Dashboard";
import { LuEye, LuDownload, LuTrash2 } from "react-icons/lu";
import { FiMoreVertical } from "react-icons/fi";
import Toast from "../../components/Toast/Toast";
import PreviewModal from "./PreviewModal";
import "./Dashboard.css";
import "./DocumentActions.css";
import ReactDOM from "react-dom";

interface Props {
    document: DocumentItem;
    onDelete?: (id: string) => void;
}

const DocumentActions: React.FC<Props> = ({ document: doc, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const confirmBtnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showConfirm) {
            setTimeout(() => confirmBtnRef.current?.focus(), 120);
        }
    }, [showConfirm]);

    useEffect(() => {
        if (!showMenu) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    const handleView = () => {
        if (doc.fileUrl) {
            setShowPreview(true);
        } else {
            alert("Không có bản xem trước cho tài liệu này!");
        }
    };

    const handleDownload = () => {
        if (doc.fileUrl) {
            const link = window.document.createElement("a");
            link.href = doc.fileUrl;
            link.download = doc.name;
            link.click();
        } else {
            alert(`Tải về: ${doc.name}`);
        }
    };

    const handleDelete = () => setShowConfirm(true);

    const confirmDelete = () => {
        setShowConfirm(false);
        if (onDelete) {
            onDelete(doc.id);
            if (doc.fileUrl) {
                URL.revokeObjectURL(doc.fileUrl);
            }
        }
        setShowToast(true);
    };

    const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + window.scrollY,
            left: rect.right - 140 + window.scrollX,
        });
        setShowMenu(true);
    };

    return (
        <div className="doc-actions">
            <button
                className="doc-action-btn"
                title="Tùy chọn"
                onClick={handleMenuOpen}
                style={{ fontSize: 22 }}
            >
                <FiMoreVertical />
            </button>

            {showMenu &&
                ReactDOM.createPortal(
                    <div
                        className="doc-actions-menu"
                        ref={menuRef}
                        style={{
                            position: "fixed",
                            top: menuPosition.top,
                            left: menuPosition.left,
                            background: "#fff",
                            boxShadow: "0 2px 12px rgba(32,80,170,0.12)",
                            borderRadius: 8,
                            minWidth: 140,
                            zIndex: 1000,
                            padding: "8px 0",
                        }}
                    >
                        <button
                            className="doc-actions-menu-item"
                            onClick={handleView}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                padding: "8px 16px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            <LuEye style={{ marginRight: 8 }} /> Xem tài liệu
                        </button>
                        <button
                            className="doc-actions-menu-item"
                            onClick={handleDownload}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                padding: "8px 16px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            <LuDownload style={{ marginRight: 8 }} /> Tải về
                        </button>
                        <button
                            className="doc-actions-menu-item"
                            onClick={handleDelete}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                padding: "8px 16px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#c82f2f",
                            }}
                        >
                            <LuTrash2 style={{ marginRight: 8 }} /> Xóa
                        </button>
                    </div>,
                    document.body
                )}

            {showPreview && (
                <PreviewModal
                    document={{
                        name: doc.name,
                        fileUrl: doc.fileUrl,
                    }}
                    onClose={() => setShowPreview(false)}
                />
            )}

            {showConfirm && (
                <div className="confirm-popup">
                    <div className="confirm-popup-content">
                        <p className="confirm-popup-text">
                            Bạn chắc chắn muốn xóa tài liệu này?
                        </p>
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                justifyContent: "center",
                            }}
                        >
                            <button
                                className="confirm-popup-btn confirm-popup-confirm-btn"
                                ref={confirmBtnRef}
                                onClick={confirmDelete}
                            >
                                Xóa
                            </button>
                            <button
                                className="confirm-popup-btn confirm-popup-cancel-btn"
                                onClick={() => setShowConfirm(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showToast && (
                <Toast
                    message="Đã xóa tài liệu!"
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default DocumentActions;
