import { useContext, useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import { useDispatch } from "react-redux";
import { postOrUpdateData, urls } from "../redux/urls";
import logo from "../../public/logo.png";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, loading, refreshUser } = useContext(AuthContext);

    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fields, setFields] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFields((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await dispatch(
            postOrUpdateData(urls.login, fields)
        );

        if (res?.success) {
            if (res?.requires_password_setup) {
                setReset({ employee_code: res?.user_id });
                setShowResetModal(true);
            } else {
                handleLogin(res);
            }

            setFields({});
        }
    };

    const handleLogin = async (data) => {
        setFields({});
        localStorage.setItem("access_token", data?.access_token);
        localStorage.setItem("refresh_token", data?.refresh_token);
        localStorage.setItem("role", data?.role);

        // Refresh AuthContext before navigating so Layout sees the user immediately
        // and does not bounce back to /login.
        await refreshUser();
        navigate("/", { replace: true });
    };

    const [showResetModal, setShowResetModal] = useState(false);
    const [reset, setReset] = useState({});

    const handleChangeReset = (e) => {
        const { name, value } = e.target;
        setReset((prev) => ({ ...prev, [name]: value }));
    };

    const validatePassword = (password) => {
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        return hasUppercase && hasNumber && hasSpecialChar;
    };

    const handleReset = async (e) => {
        e.preventDefault();

        if (reset?.password !== reset?.confirm_password) {
            toast.error("Passwords do not match");
            return;
        }

        if (!validatePassword(reset?.password)) {
            toast.error("Password must contain at least one uppercase letter, one number, and one special character");
            return;
        }

        const res = await dispatch(
            postOrUpdateData(urls.setuppassword, {
                employee_code: reset?.employee_code,
                new_password: reset?.password,
            })
        );

        if (res?.success) {
            setShowResetModal(false);
            setReset({});
        }
    };

    useEffect(() => {
        if (!loading && user) {
            navigate("/", { replace: true });
        }
    }, [loading, user, navigate]);

    // Only hide form briefly while we *know* user is authenticated (about to redirect).
    // Don't gate on `loading` — let the form render so the user always sees something.
    if (user) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "100vh", background: "#f7f7f7" }}
            >
                <div className="spinner-border text-warning" role="status" aria-label="Loading" />
            </div>
        );
    }

    return (
        <div
            className="d-flex justify-content-center align-items-center position-relative"
            style={{
                minHeight: "100vh",
                background: `#f5f5f5 url(${logo}) center/cover no-repeat`,
                backgroundAttachment: "fixed",
            }}
        >
            {/* Overlay (no backdrop-filter to avoid GPU repaint flicker) */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.6)",
                    zIndex: 1,
                }}
            />

            {/* Login Card */}
            <div
                className="card shadow border-0 position-relative"
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    borderRadius: "20px",
                    zIndex: 2,
                    background: "rgba(255,255,255,0.97)",
                }}
            >
                <div className="card-body p-4 p-md-5">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h3 className="fw-bold text-warning">
                            Welcome Back
                        </h3>

                        <p className="text-muted mb-0">
                            Login to continue
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        {/* User ID */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                User ID
                            </label>

                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <FaUser />
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter User ID"
                                    required
                                    name="employee_code"
                                    value={fields?.employee_code || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold">
                                Password
                            </label>

                            <div className="input-group">
                                <span className="input-group-text bg-white">
                                    <FaLock />
                                </span>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="form-control"
                                    placeholder="Enter Password"
                                    required
                                    name="password"
                                    value={fields?.password || ""}
                                    onChange={handleChange}
                                />

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword ? (
                                        <FaEyeSlash />
                                    ) : (
                                        <FaEye />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="btn btn-warning w-100 fw-semibold py-2"
                        >
                            Login
                        </button>
                    </form>

                    {/* Forgot Password */}
                    {/* <p className="text-center mt-3 mb-0">
                        Forgot Password?{" "}
                        <span
                            className="text-decoration-underline"
                            style={{ cursor: "pointer" }}
                        >
                            Click Here
                        </span>
                    </p> */}
                </div>
            </div>

            {/* Reset Password Modal */}
            <Modal
                showModal={showResetModal}
                title="Reset Password"
                onclose={() => setShowResetModal(false)}
                content={
                    <form onSubmit={handleReset}>
                        <div className="modal-body row">
                            <div className="col-md-12">
                                <label className="form-label">
                                    Password{" "}
                                    <span className="text-danger">*</span>
                                </label>

                                <div className="input-group">
                                    <input
                                        type={showResetPassword ? "text" : "password"}
                                        className="form-control"
                                        name="password"
                                        value={reset?.password || ""}
                                        onChange={handleChangeReset}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                    >
                                        {showResetPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="col-md-12 mt-4">
                                <label className="form-label">
                                    Confirm Password{" "}
                                    <span className="text-danger">*</span>
                                </label>

                                <div className="input-group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-control"
                                        name="confirm_password"
                                        value={
                                            reset?.confirm_password || ""
                                        }
                                        onChange={handleChangeReset}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() =>
                                    setShowResetModal(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-primary"
                                type="submit"
                            >
                                Update
                            </button>
                        </div>
                    </form>
                }
            />
        </div>
    );
}