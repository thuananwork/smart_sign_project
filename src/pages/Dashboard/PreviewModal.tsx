import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "./PreviewModal.css";

interface PreviewModalProps {
  document: { name: string; fileUrl?: string } | null;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ document, onClose }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (!document) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 12 }}>{document.name}</h3>
        <div className="preview-content">
          {document.fileUrl && document.name.toLowerCase().endsWith(".pdf") ? (
            <Worker workerUrl="/pdf.worker.min.js">
              <Viewer
                fileUrl={document.fileUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          ) : (
            <div style={{ fontSize: 18, color: "#2050aa" }}>
              {document.fileUrl ? "Chỉ hỗ trợ xem trước file PDF" : "Không có bản xem trước"}
            </div>
          )}
        </div>
        <button className="preview-close-btn" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default PreviewModal;