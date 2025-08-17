// src/types/index.ts
//để dùng data chỉ cần import { User, Document, Signature } from "../../types";
// USER
export interface User {
  user_id: string;
  username: string;
  birth_day: string;
  login_id: string; // email đăng nhập
  role: string;     // hoặc bạn có thể đổi sang string[] nếu nhiều role
  delete_flag?: number;
  created_at: string;
  update_at: string;
}

// ROLE
export interface Role {
  role_id: number;
  role_name: string;
  description?: string;
  delete_flag?: number;
  created_at: string;
  update_at: string;
}

// DOCUMENT
export interface Document {
  document_id: string;
  user_id: string;      // Người tạo
  title: string;
  file_path: string;
  status: number;       // 0: Chờ ký, 1: Đã ký, 2: Đã gửi, v.v.
  created_at: string;
  update_at: string;
}

// SIGNATURE
export interface Signature {
  signature_id: string;
  document_id: string;
  user_id: string;      // Ai là người ký
  signature_data: string; // Thường là base64 image
  signed_at: string;
  created_at: string;
  update_at: string;
}

// NOTIFICATION
export interface Notification {
  notification_id: string;
  user_id: string;
  message: string;
  status: number; // 0: chưa đọc, 1: đã đọc
  created_at: string;
  update_at: string;
}
