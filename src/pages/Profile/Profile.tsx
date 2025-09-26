import React from "react";
import "./Profile.css";
import avatar from "../../assets/images/avatar-hao.png";

const Profile: React.FC = () => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [profile, setProfile] = React.useState({
        userName: "kienhao2209",
        avatarUrl: avatar,
        email: "kienhao2209@email.com",
        fullName: "Huỳnh Kiến Hào",
        dateOfBirth: "2002-09-22",
        phoneNumber: "0842822927",
        gender: "Nam",
    });
    const [editProfile, setEditProfile] = React.useState(profile);

    React.useEffect(() => {
        if (isEditing) {
            setEditProfile(profile);
        }
    }, [isEditing, profile]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setEditProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditClick = () => {
        if (isEditing) {
            setProfile(editProfile);
        } else {
            setEditProfile(profile);
        }
        setIsEditing((edit) => !edit);
    };

    return (
        <div className="profile__page">
            {/* Avatar */}
            <div className="profile__avatar">
                <img
                    src={profile.avatarUrl}
                    alt="avatar"
                    className="profile__img"
                />
                <h2 className="profile__name">{profile.fullName}</h2>
            </div>

            {/* Profile Information */}
            <div className="profile__content">
                <h3 className="profile__heading">Thông tin cá nhân</h3>
                <form action="" className="profile__form">
                    {/* Họ tên */}
                    <section className="profile__cell">
                        <label htmlFor="fullName" className="profile__label">
                            Họ tên
                        </label>
                        <input
                            className="profile__input"
                            type="text"
                            name="fullName"
                            id="fullName"
                            // value={profile.fullName}
                            value={
                                isEditing
                                    ? editProfile.fullName
                                    : profile.fullName
                            }
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </section>

                    {/* Số điện thoại */}
                    <section className="profile__cell">
                        <label htmlFor="phoneNumber" className="profile__label">
                            Số điện thoại
                        </label>
                        <input
                            className="profile__input"
                            type="text"
                            name="phoneNumber"
                            id="phoneNumber"
                            value={
                                isEditing
                                    ? editProfile.phoneNumber
                                    : profile.phoneNumber
                            }
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </section>

                    {/* Email */}
                    <section className="profile__cell">
                        <label htmlFor="email" className="profile__label">
                            Email
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
                        onClick={() => setIsEditing(false)}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
