import React from "react";
import type { DocumentStatus } from "./Dashboard";
import "./Dashboard.css";

interface Props {
    value: DocumentStatus | "Tất cả";
    onChange: (value: DocumentStatus | "Tất cả") => void;
}

const StatusFilter: React.FC<Props> = ({ value, onChange }) => {
    return (
        <div className="status-filter">
            <label htmlFor="status-filter" className="status-filter-label">
                Lọc theo trạng thái:
            </label>
            <div className="status-filter-wrapper">
                <select
                    id="status-filter"
                    value={value}
                    onChange={(e) => onChange(e.target.value as any)}
                    className="status-filter-select"
                >
                    <option value="Tất cả">Tất cả trạng thái</option>
                    <option value="Chờ ký">Chờ ký</option>
                    <option value="Đã ký">Đã ký</option>
                </select>
                <span className="status-filter-icon">📋</span>
            </div>
        </div>
    );
};

export default StatusFilter;
