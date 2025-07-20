// src/pages/Dashboard/AssignSigner.tsx
import React from "react";
import type { DocumentItem } from "./Dashboard";
import "./Dashboard.css";

interface Props {
  document: DocumentItem;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
}

const AssignSigner: React.FC<Props> = ({ document, setDocuments }) => {
  // Đổi người ký (demo)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocuments(docs =>
      docs.map(d =>
        d.id === document.id ? { ...d, signer: e.target.value } : d
      )
    );
  };

  return (
    <input
      type="email"
      value={document.signer}
      placeholder="Nhập email người ký"
      onChange={handleChange}
      className="assign-signer-input"
    />
  );
};

export default AssignSigner;
