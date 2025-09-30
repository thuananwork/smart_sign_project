import React from "react";
import "./Dashboard.css";

interface Props {
    value: "asc" | "desc";
    onChange: (value: "asc" | "desc") => void;
}

const SortByDateSelect: React.FC<Props> = ({ value, onChange }) => (
    <div className="dashboard__sort">
        <select
            className="dashboard__sort-select"
            value={value}
            onChange={(e) => onChange(e.target.value as "asc" | "desc")}
            title="Sắp xếp theo ngày tạo"
        >
            <option value="desc">Ngày tạo ↓ (Mới nhất)</option>
            <option value="asc">Ngày tạo ↑ (Cũ nhất)</option>
        </select>
        <i className="fa-solid fa-chevron-down dashboard__sort-icon"></i>
    </div>
);

export default SortByDateSelect;
