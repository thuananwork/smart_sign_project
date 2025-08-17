// src/pages/SignaturePage/ActionButtons.tsx
import React from "react";

interface ActionButtonsProps {
    onClear: () => void;
    onPlace: () => void;
    onConfirm: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onClear, onPlace, onConfirm }) => {
    return (
        <div className="action-buttons">
            <button onClick={onClear}>Xóa</button>
            <button onClick={onPlace}>Đặt vào tài liệu</button>
            <button onClick={onConfirm}>Xác nhận và gửi</button>
        </div>
    );
};

export default ActionButtons;