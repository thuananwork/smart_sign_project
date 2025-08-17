import React, { useState, useRef, useEffect } from "react";
import type { DocumentItem } from "./Dashboard";
import { LuEye, LuDownload, LuTrash2 } from "react-icons/lu";
import Toast from "../../components/Toast/Toast";
import PreviewModal from "./PreviewModal";
import "./Dashboard.css";
import "./DocumentActions.css";

interface Props {
  document: DocumentItem;
  onDelete?: (id: string) => void;
}

const DocumentActions: React.FC<Props> = ({ document, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showConfirm) {
      setTimeout(() => confirmBtnRef.current?.focus(), 120);
    }
  }, [showConfirm]);

  const handleView = () => {
    if (document.fileUrl) {
      setShowPreview(true);
    } else {
      alert("Không có bản xem trước cho tài liệu này!");
    }
  };

  const handleDownload = () => {
    if (document.fileUrl) {
      const link = window.document.createElement("a"); // Sửa lại thành window.document
      link.href = document.fileUrl;
      link.download = document.name;
      link.click();
    } else {
      alert(`Tải về: ${document.name}`);
    }
  };

  const handleDelete = () => setShowConfirm(true);

  const confirmDelete = () => {
    setShowConfirm(false);
    if (onDelete) {
      onDelete(document.id);
      // Thu hồi fileUrl để tránh rò rỉ bộ nhớ
      if (document.fileUrl) {
        URL.revokeObjectURL(document.fileUrl);
      }
    }
    setShowToast(true);
  };

  return (
    <div className="doc-actions">
      <button className="doc-action-btn" title="Xem tài liệu" onClick={handleView}>
        <LuEye />
      </button>
      <button className="doc-action-btn" title="Tải về" onClick={handleDownload}>
        <LuDownload />
      </button>
      <button className="doc-action-btn" title="Xóa" onClick={handleDelete}>
        <LuTrash2 color="#c82f2f" />
      </button>

      {showPreview && (
        <PreviewModal
          document={{ name: document.name, fileUrl: document.fileUrl }}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showConfirm && (
        <div className="confirm-popup">
          <div className="confirm-popup-content">
            <p>Bạn chắc chắn muốn xóa tài liệu này?</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                ref={confirmBtnRef}
                onClick={confirmDelete}
                style={{ color: "#fff", background: "#c82f2f" }}
              >
                Xóa
              </button>
              <button onClick={() => setShowConfirm(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <Toast message="Đã xóa tài liệu!" onClose={() => setShowToast(false)} />
      )}
    </div>
  );
};

export default DocumentActions;