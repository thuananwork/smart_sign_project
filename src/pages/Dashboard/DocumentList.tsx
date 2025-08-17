// src/pages/Dashboard/DocumentList.tsx
import React from "react";
import type { DocumentItem } from "./Dashboard";
import AssignSigner from "./AssignSigner";
import DocumentActions from "./DocumentActions";
import "./Dashboard.css";

interface Props {
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
}

const DocumentList: React.FC<Props> = ({ documents, setDocuments }) => {
  if (documents.length === 0)
    return <div className="doc-list-empty">Chưa có tài liệu nào!</div>;

  // Hàm xóa tài liệu khỏi state (FE)
  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="doc-table-container">
      <table className="doc-table">
        <thead>
          <tr>
            <th>Tên tài liệu</th>
            <th>Ngày tạo</th>
            <th>Người ký</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.id}>
              <td>{doc.name}</td>
              <td>{doc.createdAt}</td>
              <td>
                <AssignSigner document={doc} setDocuments={setDocuments} />
              </td>
              <td>
                <span className={`doc-status doc-status-${doc.status === "Đã ký" ? "signed" : "pending"}`}>
                  {doc.status}
                </span>
              </td>
              <td>
                <DocumentActions document={doc} onDelete={handleDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;
