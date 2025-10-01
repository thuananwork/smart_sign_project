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
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    };

    return (
        <div className="table__inner">
            <table className="table__content">
                <thead>
                    <tr>
                        <th className="table__heading">Tên tài liệu</th>
                        <th className="table__heading">Ngày tạo</th>
                        <th className="table__heading">Người ký</th>
                        <th className="table__heading">Trạng thái</th>
                        <th className="table__heading">Hành động</th>
                    </tr>
                </thead>
                <tbody className="table__body">
                    {documents.map((doc) => (
                        <tr className="table__row" key={doc.id}>
                            <td className="table__data table__name">
                                {doc.name}
                            </td>
                            <td className="table__data table__created-at">
                                {doc.createdAt}
                            </td>
                            <td className="table__data table__signer">
                                <AssignSigner
                                    document={doc}
                                    setDocuments={setDocuments}
                                />
                            </td>
                            <td className="table__data">
                                <span
                                    className={`doc-status doc-status-${
                                        doc.status === "Đã ký"
                                            ? "signed"
                                            : "pending"
                                    }`}
                                >
                                    {doc.status}
                                </span>
                            </td>
                            <td className="table__data">
                                <DocumentActions
                                    document={doc}
                                    onDelete={handleDelete}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DocumentList;
