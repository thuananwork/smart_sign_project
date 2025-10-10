import React, { useState } from "react";
import FileUpload from "./FileUpload";
import DocumentList from "./DocumentList";
import StatusFilter from "./StatusFilter";
import Header from "../../components/Header/Header";
import BottomBar from "../../components/Footer/BottomBar/BottomBar";
import SortByDateSelect from "./SortByDateSelect";
import "./Dashboard.css";
import "../../styles/Background.css";
import SearchPdfInput from "./SearchPdfInput";

export type DocumentStatus = "Chờ ký" | "Đã ký";

export interface DocumentItem {
    id: string;
    name: string;
    createdAt: string;
    status: DocumentStatus;
    signer: string;
    fileUrl?: string;
}

export const mockDocuments: DocumentItem[] = [
    {
        id: "1",
        name: "Hợp đồng lao động đã ký hợp đồng với nguễn thuận và và tuân thủ hợp đồng lao động của anh ấy.pdf",
        createdAt: "2025-06-14",
        status: "Chờ ký",
        signer: "user1@gmail.com",
    },
    {
        id: "2",
        name: "Biên bản nghiệm thu.png",
        createdAt: "2025-06-12",
        status: "Đã ký",
        signer: "user2@gmail.com",
    },
    {
        id: "3",
        name: "Hợp đồng kinh tế.docx",
        createdAt: "2025-06-11",
        status: "Chờ ký",
        signer: "",
    },
    {
        id: "4",
        name: "Phụ lục hợp đồng.pdf",
        createdAt: "2025-06-10",
        status: "Đã ký",
        signer: "user3@gmail.com",
    },
    {
        id: "5",
        name: "Cam kết bảo mật.docx",
        createdAt: "2025-06-09",
        status: "Chờ ký",
        signer: "",
    },
    {
        id: "6",
        name: "Biên bản bàn giao.jpg",
        createdAt: "2025-06-08",
        status: "Đã ký",
        signer: "user4@gmail.com",
    },
    {
        id: "7",
        name: "Hợp đồng thuê nhà giữa Nguyễn Văn A và công ty TNHH XYZ.pdf",
        createdAt: "2025-06-07",
        status: "Chờ ký",
        signer: "user5@gmail.com",
    },
    {
        id: "8",
        name: "Giấy ủy quyền sử dụng tài sản cá nhân.docx",
        createdAt: "2025-06-06",
        status: "Đã ký",
        signer: "user6@gmail.com",
    },
    {
        id: "9",
        name: "Biên bản thanh lý hợp đồng dịch vụ dài hạn.jpg",
        createdAt: "2025-06-05",
        status: "Chờ ký",
        signer: "",
    },
];

const Dashboard: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentItem[]>(() => {
        const saved = localStorage.getItem("documents");
        const parsed: DocumentItem[] = saved ? JSON.parse(saved) : [];
        // Sanitize legacy blob: URLs which may expire; keep only data/http
        return parsed.map((d) => {
            const url = d.fileUrl || "";
            const isDataOrHttp =
                url.startsWith("data:") || url.startsWith("http");
            return { ...d, fileUrl: isDataOrHttp ? d.fileUrl : undefined };
        });
    });

    React.useEffect(() => {
        localStorage.setItem("documents", JSON.stringify(documents));
    }, [documents]);

    const [filter, setFilter] = useState<DocumentStatus | "Tất cả">("Tất cả");
    const [search, setSearch] = useState("");
    const filteredDocs =
        filter === "Tất cả"
            ? documents
            : documents.filter((doc) => doc.status === filter);

    function removeAccents(str: string) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    const searchedDocs = filteredDocs.filter(
        (doc) =>
            removeAccents(doc.name.toLowerCase()).includes(
                removeAccents(search.toLowerCase())
            ) && doc.name.toLowerCase().endsWith(".pdf")
    );

    const handleUpload = (name: string, fileUrl: string) => {
        const newDoc: DocumentItem = {
            id: (documents.length + 1).toString(),
            name,
            createdAt: new Date().toISOString().slice(0, 10),
            status: "Chờ ký",
            signer: "",
            fileUrl,
        };
        setDocuments([newDoc, ...documents]);
    };
    const userName =
        localStorage.getItem("profileFullName") || "Huỳnh Kiến Hào";
    const avatarUrl = localStorage.getItem("profileAvatarUrl") || undefined;
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const sortedDocs = React.useMemo(() => {
        return [...searchedDocs].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
    }, [searchedDocs, sortOrder]);

    return (
        <div className="background-root">
            <Header
                userName={userName}
                avatarUrl={avatarUrl}
                onLogout={() => (window.location.href = "/")}
            />
            <div className="dashboard__root">
                <h1 className="dashboard__heading">QUẢN LÝ HỢP ĐỒNG</h1>
                <div className="dashboard__controls">
                    <FileUpload onUpload={handleUpload} />
                    <SearchPdfInput value={search} onChange={setSearch} />
                    <SortByDateSelect
                        value={sortOrder}
                        onChange={setSortOrder}
                    />
                    <StatusFilter value={filter} onChange={setFilter} />
                </div>
                <DocumentList
                    documents={sortedDocs}
                    setDocuments={setDocuments}
                />
                <BottomBar />
            </div>
        </div>
    );
};

export default Dashboard;
