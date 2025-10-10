import React, { useRef, useEffect } from "react";
import "./Profile.css";
import avatar from "../../assets/images/avatar-hao.png";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "./utils/cropImage";
import type { Area } from "react-easy-crop";

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = React.useState(false);
    const [profile, setProfile] = React.useState({
        userName: "kienhao2209",
        avatarUrl: localStorage.getItem("profileAvatarUrl") || avatar,
        email: "kienhao2209@gmail.com",
        fullName: "Huỳnh Kiến Hào",
        dateOfBirth: "2002-09-22",
        phoneNumber: "0842822927",
        gender: "Nam",
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

    // Cắt xén hình ảnh trước khi upload file
    const [cropModalOpen, setCropModalOpen] = React.useState(false);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(
        null
    );
    const [crop, setCrop] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);

    const [croppedAreaPixels, setCroppedAreaPixels] =
        React.useState<Area | null>(null);

    useEffect(() => {
        if (profile.avatarUrl) {
            localStorage.setItem("profileAvatarUrl", profile.avatarUrl);
        }
    }, [profile.avatarUrl]);

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
            // Sync full name for other pages
            try {
                localStorage.setItem("profileFullName", editProfile.fullName);
            } catch {}
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
                        <i className="fa-solid fa-camera profile__camera-icon"></i>
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
                                    <i className="fa-solid fa-user profile-menu__icon"></i>
                                    <span className="profile-menu__text">
                                        Xem ảnh đại diện
                                    </span>
                                </button>

                                {/* Chọn ảnh đại diện */}
                                <label
                                    className="profile-menu__btn"
                                    style={{ cursor: "pointer" }}
                                >
                                    <i className="fa-solid fa-images profile-menu__icon"></i>
                                    <span className="profile-menu__text">
                                        Chọn ảnh đại diện
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            setShowAvatarMenu(false);
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    setSelectedImage(
                                                        ev.target
                                                            ?.result as string
                                                    );
                                                    setCropModalOpen(true);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
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
                >
                    <div
                        className="avatar__modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="avatar__modal-header">
                            <h2 className="avatar__modal-name">
                                {profile.fullName}
                            </h2>
                            <button
                                className="avatar__modal-btn"
                                onClick={() => setShowAvatarModal(false)}
                            >
                                <i className="fa-solid fa-xmark avatar__modal-btn--close"></i>
                            </button>
                        </div>

                        <div className="avatar__modal-background">
                            <figure className="avatar__modal-images">
                                <img
                                    className="avatar__modal-img"
                                    src={profile.avatarUrl}
                                    alt="avatar"
                                    style={{
                                        display: "block",
                                        width: `calc(100% * ${avatarZoom})`,
                                        height: `calc(100% * ${avatarZoom})`,
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
                                            next = Math.max(
                                                1,
                                                Math.min(2, next)
                                            );
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
                            </figure>
                        </div>

                        <div className="avatar__modal-footer">
                            <a
                                href={profile.avatarUrl}
                                download="avatar.jpg"
                                style={{
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
                        </div>
                    </div>
                </div>
            )}

            {cropModalOpen && selectedImage && (
                <div className="avatar-crop-modal">
                    <div className="avatar-crop-modal-content">
                        <Cropper
                            image={selectedImage}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape="round"
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, croppedAreaPixels) => {
                                setCroppedAreaPixels(croppedAreaPixels);
                            }}
                        />
                        <div className="avatar-crop-modal-actions">
                            <button
                                onClick={async () => {
                                    if (selectedImage && croppedAreaPixels) {
                                        const croppedImg = await getCroppedImg(
                                            selectedImage,
                                            croppedAreaPixels
                                        );
                                        setProfile((prev) => ({
                                            ...prev,
                                            avatarUrl: croppedImg,
                                        }));
                                        setCropModalOpen(false);
                                        setSelectedImage(null);
                                    }
                                }}
                            >
                                Lưu ảnh
                            </button>
                            <button
                                onClick={() => {
                                    setCropModalOpen(false);
                                    setSelectedImage(null);
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
