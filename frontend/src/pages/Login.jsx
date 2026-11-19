
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, Lock, User, ArrowRight } from "lucide-react";
import api from "../services/api";
import "../App.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("auth/login/", {
                username,
                password,
            });

            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Invalid username or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-brand">
                    <div className="login-brand-icon">
                        <Headphones size={28} />
                    </div>

                    <h1>ResolveAI</h1>
                    <p>Support Intelligence Platform</p>
                </div>

                <div className="login-heading">
                    <h2>Welcome back</h2>
                    <p>Sign in to access your support dashboard.</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="login-input-group">
                        <label>Username</label>

                        <div className="login-input-wrapper">
                            <User size={18} />

                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label>Password</label>

                        <div className="login-input-wrapper">
                            <Lock size={18} />

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                </form>

                <div className="login-footer">
                    Secure access for support agents
                </div>

            </div>

            <p className="login-copyright">
                © 2026 ResolveAI. All rights reserved.
            </p>

        </div>
    );
}

export default Login;
