
import { useState } from "react";
import { Headphones, Send, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function CustomerTicket() {
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_email: "",
        subject: "",
        description: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess(null);

        try {
            const response = await api.post("tickets/", formData);

            setSuccess(response.data);

            setFormData({
                customer_name: "",
                customer_email: "",
                subject: "",
                description: "",
            });
        } catch (err) {
            const data = err.response?.data;

            if (data && typeof data === "object") {
                const messages = Object.entries(data)
                    .map(([field, value]) => {
                        const message = Array.isArray(value)
                            ? value.join(" ")
                            : String(value);

                        return `${field}: ${message}`;
                    })
                    .join("\n");

                setError(messages || "Unable to submit your ticket.");
            } else {
                setError("Unable to submit your ticket. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="customer-ticket-page">

            <div className="customer-ticket-header">
                <Link to="/login" className="customer-back-link">
                    <ArrowLeft size={17} />
                    Support Team Login
                </Link>

                <div className="customer-brand">
                    <div className="customer-brand-icon">
                        <Headphones size={25} />
                    </div>

                    <div>
                        <h1>ResolveAI</h1>
                        <p>Customer Support</p>
                    </div>
                </div>
            </div>

            <div className="customer-ticket-container">

                {success ? (
                    <div className="ticket-success-card">
                        <div className="success-icon">
                            <CheckCircle size={38} />
                        </div>

                        <h2>Ticket Submitted Successfully!</h2>

                        <p>
                            Thank you for contacting us.
                            Your support request has been received.
                        </p>

                        <div className="ticket-reference">
                            <span>Your Ticket ID</span>
                            <strong>#{String(success.id).slice(0, 8)}</strong>
                        </div>

                        <p className="success-note">
                            Our support team will review your request.
                        </p>

                        <button
                            className="customer-submit-button"
                            onClick={() => setSuccess(null)}
                        >
                            Submit Another Ticket
                        </button>
                    </div>
                ) : (
                    <div className="customer-ticket-card">

                        <div className="customer-ticket-heading">
                            <h2>How can we help you?</h2>
                            <p>
                                Describe your issue below and our support
                                team will get back to you.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="customer-form-group">
                                <label htmlFor="customer_name">
                                    Full Name
                                </label>

                                <input
                                    id="customer_name"
                                    type="text"
                                    name="customer_name"
                                    placeholder="Enter your full name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="customer-form-group">
                                <label htmlFor="customer_email">
                                    Email Address
                                </label>

                                <input
                                    id="customer_email"
                                    type="email"
                                    name="customer_email"
                                    placeholder="Enter your email address"
                                    value={formData.customer_email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="customer-form-group">
                                <label htmlFor="subject">
                                    Subject
                                </label>

                                <input
                                    id="subject"
                                    type="text"
                                    name="subject"
                                    placeholder="Briefly describe your issue"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="customer-form-group">
                                <label htmlFor="description">
                                    Issue Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Explain your issue in detail..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="customer-form-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="customer-submit-button"
                                disabled={loading}
                            >
                                <Send size={17} />
                                {loading ? "Submitting..." : "Submit Ticket"}
                            </button>

                        </form>

                        <p className="customer-privacy-note">
                            No account required. Your request will be
                            securely submitted to our support team.
                        </p>

                    </div>
                )}

            </div>

            <footer className="customer-ticket-footer">
                © 2026 ResolveAI. All rights reserved.
            </footer>

        </div>
    );
}

export default CustomerTicket;
