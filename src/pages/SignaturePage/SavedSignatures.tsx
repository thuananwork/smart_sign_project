// src/pages/SignaturePage/SavedSignatures.tsx
import React from "react";

interface SavedSignaturesProps {
    onSelect: (dataUrl: string | null) => void;
}

const SavedSignatures: React.FC<SavedSignaturesProps> = ({ onSelect }) => {
    const savedSignature = localStorage.getItem("savedSignature");

    return (
        <div className="saved-signatures">
            <h3>Chữ ký đã lưu</h3>
            {savedSignature ? (
                <div>
                    <img src={savedSignature} alt="Saved Signature" style={{ maxWidth: "100%" }} />
                    <button onClick={() => onSelect(savedSignature)}>Chọn</button>
                </div>
            ) : (
                <p>Không có chữ ký nào được lưu.</p>
            )}
        </div>
    );
};

export default SavedSignatures;