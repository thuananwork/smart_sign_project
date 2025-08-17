import { User, Document, Signature } from "../types";

export const mockUser: User = {
  user_id: "admin001",
  username: "Nguyễn Thuận An",
  birth_day: "1997-12-06",
  login_id: "admin@gmail.com",
  role: "admin",
  delete_flag: 0,
  created_at: "2025-06-14T08:00:00Z",
  update_at: "2025-06-14T08:00:00Z"
};

export const mockDocuments: Document[] = [
  {
    document_id: "doc001",
    user_id: "admin001",
    title: "Hợp đồng dịch vụ 2025",
    file_path: "/files/doc001.pdf",
    status: 0,
    created_at: "2025-06-12T10:21:00Z",
    update_at: "2025-06-12T10:21:00Z"
  },
  // ...thêm nữa nếu muốn
];
