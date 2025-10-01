import React from "react";
import "./Dashboard.css";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const SearchPdfInput: React.FC<Props> = ({ value, onChange }) => (
    <input
        className="dashboard__search-input"
        type="text"
        placeholder="Tìm kiếm file PDF theo tên..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
    />
);

export default SearchPdfInput;
