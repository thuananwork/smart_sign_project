// src/pages/SignaturePage/SignatureTools.tsx
import React from "react";

const SignatureTools: React.FC = () => {
    const [color, setColor] = React.useState("#000000");
    const [lineWidth, setLineWidth] = React.useState(2);

    // Logic truyền màu và độ dày đến CanvasSignature (cần tích hợp thêm)
    const applyTools = () => {
        console.log("Áp dụng: Màu", color, "Độ dày", lineWidth);
    };

    return (
        <div className="signature-tools">
            <h3>Công cụ</h3>
            <label>
                Màu:
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
            <label>
                Độ dày:
                <input
                    type="range"
                    min="1"
                    max="10"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(parseInt(e.target.value))}
                />
                {lineWidth}
            </label>
            <button onClick={applyTools}>Áp dụng</button>
        </div>
    );
};

export default SignatureTools;