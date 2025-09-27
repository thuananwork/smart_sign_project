import React, { useRef, useEffect } from "react";
import "./Profile.css";
import avatar from "../../assets/images/avatar-hao.png";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = React.useState(false);
    const [profile, setProfile] = React.useState({
        userName: "kienhao2209",
        avatarUrl: avatar,
        email: "kienhao2209@gmail.com",
        fullName: "Huỳnh Kiến Hào",
        dateOfBirth: "2002-09-22",
        phoneNumber: "0842822927",
        gender: "Nam",
        photoUpdatedAt: "2024-09-28 10:00",
    });
    const [editProfile, setEditProfile] = React.useState(profile);
    const [fullNameError, setFullNameError] = React.useState("");
    const [phoneNumberError, setPhoneNumberError] = React.useState("");
    const [emailError, setEmailError] = React.useState("");
    const [showAvatarMenu, setShowAvatarMenu] = React.useState(false);
    const avatarMenuRef = useRef<HTMLDivElement>(null);
    const avatarImagesRef = useRef<HTMLDivElement>(null);
    const [showAvatarModal, setShowAvatarModal] = React.useState(false);
    const [avatarZoom, setAvatarZoom] = React.useState(1);
    const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!showAvatarMenu) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                avatarMenuRef.current &&
                !avatarMenuRef.current.contains(event.target as Node) &&
                avatarImagesRef.current &&
                !avatarImagesRef.current.contains(event.target as Node)
            ) {
                setShowAvatarMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAvatarMenu]);

    React.useEffect(() => {
        if (isEditing) {
            setEditProfile(profile);
        }
    }, [isEditing, profile]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        if (name === "phoneNumber") {
            if (!/^\d*$/.test(value)) return;
        }
        setEditProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditClick = () => {
        if (isEditing) {
            let hasError = false;
            if (!editProfile.fullName.trim()) {
                setFullNameError("Họ tên không được để trống.");
                hasError = true;
            } else {
                setFullNameError("");
            }
            if (!editProfile.email.trim()) {
                setEmailError("Email không được để trống.");
                hasError = true;
            } else if (
                !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(editProfile.email)
            ) {
                setEmailError(
                    "Email không đúng định dạng. Vui lòng nhập email có đuôi @gmail.com"
                );
                hasError = true;
            } else {
                setEmailError("");
            }
            if (!editProfile.phoneNumber.trim()) {
                setPhoneNumberError("Số điện thoại không được để trống.");
                hasError = true;
            } else if (!/^0\d{9}$/.test(editProfile.phoneNumber)) {
                setPhoneNumberError(
                    "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0."
                );
                hasError = true;
            } else {
                setPhoneNumberError("");
            }
            if (hasError) return;
            setProfile(editProfile);
        } else {
            setEditProfile(profile);
            setFullNameError("");
            setEmailError("");
            setPhoneNumberError("");
        }
        setIsEditing((edit) => !edit);
    };

    return (
        <div className="profile__page">
            {/* Avatar */}
            <div className="profile__taskbar">
                <div className="profile__avatar">
                    <div
                        className="profile__images"
                        ref={avatarImagesRef}
                        onClick={() => setShowAvatarMenu((prev) => !prev)}
                    >
                        <img
                            src={profile.avatarUrl}
                            alt="avatar"
                            className="profile__img"
                        />
                    </div>
                    <div className="profile__camera">
                        <svg
                            className="profile__camera-icon"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 640"
                        >
                            <path d="M213.1 128.8L202.7 160L128 160C92.7 160 64 188.7 64 224L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 224C576 188.7 547.3 160 512 160L437.3 160L426.9 128.8C420.4 109.2 402.1 96 381.4 96L258.6 96C237.9 96 219.6 109.2 213.1 128.8zM320 256C373 256 416 299 416 352C416 405 373 448 320 448C267 448 224 405 224 352C224 299 267 256 320 256z" />
                        </svg>
                    </div>

                    {showAvatarMenu && (
                        <div className="profile-menu" ref={avatarMenuRef}>
                            <div className="profile-menu__item">
                                {/* Xem ảnh đại diện */}
                                <button
                                    className="profile-menu__btn"
                                    onClick={() => {
                                        setShowAvatarMenu(false);
                                        setShowAvatarModal(true);
                                    }}
                                >
                                    <svg
                                        className="profile-menu__icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 640"
                                    >
                                        <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
                                    </svg>
                                    <span className="profile-menu__text">
                                        Xem ảnh đại diện
                                    </span>
                                </button>

                                {/* Chọn ảnh đại diện */}
                                <button
                                    className="profile-menu__btn"
                                    onClick={() => {
                                        setShowAvatarMenu(false);
                                        alert("Change Avatar clicked");
                                    }}
                                >
                                    <svg
                                        className="profile-menu__icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 640"
                                    >
                                        <path d="M128 160C128 124.7 156.7 96 192 96L512 96C547.3 96 576 124.7 576 160L576 416C576 451.3 547.3 480 512 480L192 480C156.7 480 128 451.3 128 416L128 160zM56 192C69.3 192 80 202.7 80 216L80 512C80 520.8 87.2 528 96 528L456 528C469.3 528 480 538.7 480 552C480 565.3 469.3 576 456 576L96 576C60.7 576 32 547.3 32 512L32 216C32 202.7 42.7 192 56 192zM224 224C241.7 224 256 209.7 256 192C256 174.3 241.7 160 224 160C206.3 160 192 174.3 192 192C192 209.7 206.3 224 224 224zM420.5 235.5C416.1 228.4 408.4 224 400 224C391.6 224 383.9 228.4 379.5 235.5L323.2 327.6L298.7 297C294.1 291.3 287.3 288 280 288C272.7 288 265.8 291.3 261.3 297L197.3 377C191.5 384.2 190.4 394.1 194.4 402.4C198.4 410.7 206.8 416 216 416L488 416C496.7 416 504.7 411.3 508.9 403.7C513.1 396.1 513 386.9 508.4 379.4L420.4 235.4z" />
                                    </svg>
                                    <span className="profile-menu__text">
                                        Chọn ảnh đại diện
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <h2 className="profile__name line-clamp">{profile.fullName}</h2>
            </div>

            {/* Profile Information */}
            <div className="profile__content">
                <h3 className="profile__heading">Thông tin cá nhân</h3>
                <form action="" className="profile__form">
                    {/* Họ tên */}
                    <section className="profile__cell">
                        <label htmlFor="fullName" className="profile__label">
                            Họ tên
                            <span style={{ color: "red", marginLeft: "5px" }}>
                                *
                            </span>
                        </label>
                        <input
                            className="profile__input"
                            type="text"
                            name="fullName"
                            id="fullName"
                            value={
                                isEditing
                                    ? editProfile.fullName
                                    : profile.fullName
                            }
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                        {fullNameError && (
                            <span
                                className="profile__error"
                                style={{ color: "red", fontSize: "0.9em" }}
                            >
                                {fullNameError}
                            </span>
                        )}
                    </section>

                    {/* Số điện thoại */}
                    <section className="profile__cell">
                        <label htmlFor="phoneNumber" className="profile__label">
                            Số điện thoại
                            <span style={{ color: "red", marginLeft: "5px" }}>
                                *
                            </span>
                        </label>
                        <input
                            className="profile__input"
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            value={
                                isEditing
                                    ? editProfile.phoneNumber
                                    : profile.phoneNumber
                            }
                            onChange={handleChange}
                            disabled={!isEditing}
                            pattern="^(0|\+?84)(3|5|7|8|9)[0-9]{8}$"
                        />
                        {phoneNumberError && (
                            <span
                                className="profile__error"
                                style={{ color: "red", fontSize: "0.9em" }}
                            >
                                {phoneNumberError}
                            </span>
                        )}
                    </section>

                    {/* Email */}
                    <section className="profile__cell">
                        <label htmlFor="email" className="profile__label">
                            Email
                            <span style={{ color: "red", marginLeft: "5px" }}>
                                *
                            </span>
                        </label>
                        <input
                            className="profile__input"
                            type="email"
                            name="email"
                            id="email"
                            value={
                                isEditing ? editProfile.email : profile.email
                            }
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                        {emailError && (
                            <span
                                className="profile__error"
                                style={{ color: "red", fontSize: "0.9em" }}
                            >
                                {emailError}
                            </span>
                        )}
                    </section>

                    {/* Giới tính */}
                    <section className="profile__cell">
                        <label htmlFor="gender" className="profile__label">
                            Giới tính
                        </label>
                        <select
                            id="gender"
                            name="gender"
                            className="profile__input"
                            value={
                                isEditing ? editProfile.gender : profile.gender
                            }
                            onChange={handleChange}
                            disabled={!isEditing}
                        >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </section>

                    {/* Ngày sinh */}
                    <section className="profile__cell">
                        <label htmlFor="dateOfBirth" className="profile__label">
                            Ngày sinh
                        </label>
                        <input
                            className="profile__input"
                            type="date"
                            name="dateOfBirth"
                            id="dateOfBirth"
                            value={
                                isEditing
                                    ? editProfile.dateOfBirth
                                    : profile.dateOfBirth
                            }
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </section>
                </form>

                <div className="profile__row">
                    <button
                        type="button"
                        className="profile__btn profile__edit"
                        onClick={handleEditClick}
                    >
                        {isEditing ? "Lưu" : "Chỉnh sửa"}
                    </button>
                    <button
                        type="button"
                        className="profile__btn profile__close"
                        onClick={() => navigate("/dashboard")}
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* Avatar Modal */}
            {showAvatarModal && (
                <div
                    className="avatar__modal"
                    onClick={() => setShowAvatarModal(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="avatar__modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            padding: 24,
                            borderRadius: 8,
                            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                            textAlign: "center",
                            minWidth: 320,
                        }}
                    >
                        <h2 style={{ marginBottom: 16 }}>Ảnh đại diện</h2>
                        <div
                            style={{
                                width: 240,
                                height: 240,
                                margin: "0 auto",
                                overflow: "hidden",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f5f5f5",
                            }}
                        >
                            <img
                                src={profile.avatarUrl}
                                alt="avatar"
                                style={{
                                    width: 240 * avatarZoom,
                                    height: 240 * avatarZoom,
                                    borderRadius: "50%",
                                    cursor: "zoom-in",
                                    objectFit: "cover",
                                    transition: "transform 0.2s",
                                    transform: `scale(${avatarZoom})`,
                                }}

                                // Handle zoom with mouse wheel
                                onWheel={(e) => {
                                    e.preventDefault();
                                    setAvatarZoom((z) => {
                                        let next =
                                            z + (e.deltaY < 0 ? 0.4 : -0.4);
                                        next = Math.max(1, Math.min(2, next));
                                        return next;
                                    });
                                }}
                                
                                // Handle single and double click
                                onClick={() => {
                                    if (clickTimeout.current) {
                                        clearTimeout(clickTimeout.current);
                                        clickTimeout.current = null;
                                        setAvatarZoom((z) =>
                                            Math.max(1, z - 0.4)
                                        );
                                    } else {
                                        clickTimeout.current = setTimeout(
                                            () => {
                                                setAvatarZoom((z) =>
                                                    Math.min(2, z + 0.4)
                                                );
                                                clickTimeout.current = null;
                                            },
                                            250
                                        );
                                    }
                                }}
                                onDoubleClick={() => setAvatarZoom(1)}
                            />
                        </div>

                        <div
                            style={{
                                color: "#888",
                                fontSize: 13,
                                margin: "8px 0",
                            }}
                        >
                            Cuộn chuột để phóng to/thu nhỏ
                        </div>
                        <div
                            style={{
                                margin: "16px 0",
                                color: "#666",
                                fontSize: 14,
                            }}
                        >
                            Cập nhật: {profile.photoUpdatedAt || "Không rõ"}
                        </div>
                        <div>
                            <a
                                href={profile.avatarUrl}
                                download="avatar.jpg"
                                style={{
                                    marginRight: 12,
                                    padding: "8px 24px",
                                    borderRadius: 4,
                                    border: "none",
                                    background: "#28a745",
                                    color: "#fff",
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    display: "inline-block",
                                }}
                            >
                                Tải xuống
                            </a>
                            <button
                                style={{
                                    padding: "8px 24px",
                                    borderRadius: 4,
                                    border: "none",
                                    background: "#2050aa",
                                    color: "#fff",
                                    cursor: "pointer",
                                }}
                                onClick={() => setShowAvatarModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
