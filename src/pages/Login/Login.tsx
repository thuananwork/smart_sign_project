import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const adminEmails = ["thanan524@gmail.com", "admin2@congty.com"];

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    const { credential } = credentialResponse;
    if (!credential) {
      setError("Không nhận được credential từ Google.");
      setLoading(false);
      return;
    }
    try {
      const user: any = jwtDecode(credential);
      const userEmail: string = user.email;

      localStorage.setItem("token", credential);
      localStorage.setItem("userEmail", userEmail);

      navigate("/dashboard");

    } catch (e) {
      setError("Đăng nhập không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = () => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại!");
    setLoading(false);
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <h1 className="login-title">Ký Hợp Đồng Điện Tử</h1>
        <p className="login-desc">Bạn cần đăng nhập bằng Google để tiếp tục sử dụng hệ thống</p>
        {error && (
          <div className="login-error">{error}</div>
        )}
        {loading ? (
          <div className="login-loading">Đang xử lý đăng nhập...</div>
        ) : (
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            useOneTap
          />
        )}
      </div>
      <p className="login-footer">
        © Được tạo bởi Nguyễn Thuận An.
      </p>
    </div>
  );
};

export default Login;