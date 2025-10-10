import React, { useRef, useState } from "react";
import "./Dashboard.css";

interface Props {
    onUpload: (fileName: string, fileUrl: string) => void;
}

const FileUpload: React.FC<Props> = ({ onUpload }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.includes("pdf")) {
                alert("Vui lòng chọn file PDF!");
                return;
            }
            setIsUploading(true);

            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string; // data:application/pdf;base64,...
                onUpload(file.name, dataUrl);
                setIsUploading(false);
                e.target.value = ""; // Reset input
            };
            reader.onerror = () => {
                setIsUploading(false);
                alert("Không thể đọc tệp PDF. Vui lòng thử lại!");
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="file-upload">
            <button
                className="file-upload-btn"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
            >
                {isUploading ? "Đang tải..." : "+ Chọn tệp PDF"}
            </button>
            <input
                type="file"
                hidden
                ref={inputRef}
                accept="application/pdf"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default FileUpload;
