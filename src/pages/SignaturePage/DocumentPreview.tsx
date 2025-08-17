import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

type PreviewFile = { url: string; name: string; type: string };

interface Props {
    file: PreviewFile;
    signatureData?: string | null;

    /** Tuỳ chỉnh kích thước tài liệu:
     *  - maxWidth: thu hẹp chiều ngang (vd "880px" hoặc "70%")
     *  - maxHeight: giới hạn chiều dọc (vd "600px") -> có scroll nội bộ
     */
    maxWidth?: number | string;
    maxHeight?: number | string;
}

const DocumentPreview: React.FC<Props> = ({
    file,
    signatureData,
    maxWidth = "880px",     // << chỉnh ngang ở đây nếu muốn
    maxHeight,              // << chỉnh dọc ở đây (vd "600px")
}) => {
    const isPdf = file.type?.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type?.startsWith("image/");

    const wrapperStyle: React.CSSProperties = {
        position: "relative",        // để overlay chữ ký nổi phía trên
        maxWidth,
        maxHeight,
        margin: "12px auto",
        overflow: maxHeight ? "auto" : "visible",
    };

    if (isPdf) {
        return (
            <div style={wrapperStyle}>
                <Worker workerUrl="/pdf.worker.min.js">
                    <Viewer fileUrl={file.url} />
                </Worker>

                {signatureData && (
                    <img
                        src={signatureData}
                        alt="Signature overlay"
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            maxWidth: "22%",
                            pointerEvents: "none",
                            zIndex: 2,
                        }}
                    />
                )}
            </div>
        );
    }

    if (isImage) {
        return (
            <div style={{ ...wrapperStyle }}>
                <img
                    src={file.url}
                    alt="Document"
                    style={{ display: "block", width: "100%", height: "auto" }}
                />
                {signatureData && (
                    <img
                        src={signatureData}
                        alt="Signature overlay"
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            maxWidth: "22%",
                            pointerEvents: "none",
                            zIndex: 2,
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div
            style={{
                border: "1px dashed #c9d6f0",
                borderRadius: 8,
                padding: 16,
                color: "#2050aa",
                background: "#f7faff",
                margin: "12px auto",
                maxWidth,
            }}
        >
            Không hỗ trợ xem trước định dạng này. Hãy dùng <b>PDF</b> hoặc <b>ảnh</b>.
            <div style={{ marginTop: 8, fontSize: 12, color: "#6a7384" }}>
                File: {file.name} ({file.type || "unknown"})
            </div>
        </div>
    );
};

export default DocumentPreview;
