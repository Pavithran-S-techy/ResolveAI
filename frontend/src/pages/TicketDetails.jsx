
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
    LayoutDashboard,
    Ticket,
    Headphones,
    ArrowLeft,
    User,
    Mail,
    Calendar,
    Sparkles,
    Copy,
    Check,
    MessageSquare
} from "lucide-react";

import api from "../services/api";
import "../App.css";

function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const fetchTicket = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`tickets/${id}/`);
            setTicket(response.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load ticket details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const generateReply = async () => {
        try {
            setGenerating(true);
            setError("");

            const response = await api.post(
                `tickets/${id}/generate-reply/`
            );

            setTicket((previous) => ({
                ...previous,
                suggested_response: response.data.suggested_response
            }));
        } catch (err) {
            console.error(err);
            setError("Unable to generate suggested reply.");
        } finally {
            setGenerating(false);
        }
    };

    const updateStatus = async (newStatus) => {
        const previousStatus = ticket.status;

        setTicket((previous) => ({
            ...previous,
            status: newStatus
        }));

        try {
            await api.patch(`tickets/${id}/`, {
                status: newStatus
            });
            setError("");
        } catch (err) {
            console.error(err);

            setTicket((previous) => ({
                ...previous,
                status: previousStatus
            }));

            setError("Unable to update ticket status.");
        }
    };

    const copyReply = async () => {
        try {
            await navigator.clipboard.writeText(
                ticket.suggested_response
            );
            setCopied(true);

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(err);
            setError("Unable to copy the suggested reply.");
        }
    };

    const formatLabel = (value) => {
        if (!value) return "Unknown";

        return value
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatDate = (date) => {
        if (!date) return "Unknown";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="app-container">

            <aside className="sidebar">

                <div className="brand">
                    <div className="brand-icon">
                        <Headphones size={23} />
                    </div>

                    <div>
                        <h2>ResolveAI</h2>
                        <span>Support Intelligence</span>
                    </div>
                </div>

                <div className="nav-section">
                    <p className="nav-heading">WORKSPACE</p>

                    <Link to="/" className="nav-item">
                        <LayoutDashboard size={19} />
                        <span>Dashboard</span>
                    </Link>

                    <Link to="/tickets" className="nav-item active">
                        <Ticket size={19} />
                        <span>Tickets</span>
                    </Link>

                </div>

            </aside>

            <main className="main-content">

                <header className="topbar">
                    <div className="breadcrumb">
                        Workspace <span>/</span> Tickets <span>/</span> Details
                    </div>

                </header>

                <section className="dashboard-content details-content">

                    <button
                        className="refresh-button back-button"
                        onClick={() => navigate("/tickets")}
                    >
                        <ArrowLeft size={16} />
                        Back to Tickets
                    </button>

                    {loading ? (
                        <div className="ticket-message">
                            Loading ticket details...
                        </div>
                    ) : error && !ticket ? (
                        <div className="ticket-message ticket-error">
                            {error}
                            <button onClick={fetchTicket}>Retry</button>
                        </div>
                    ) : ticket ? (
                        <>
                            <div className="page-heading details-heading">
                                <div>
                                    <h1>Ticket Details</h1>
                                    <p>
                                        Ticket #{ticket.id.slice(0, 8)}
                                    </p>
                                </div>

                                <span className={`status-badge ${ticket.status}`}>
                                    {formatLabel(ticket.status)}
                                </span>
                            </div>

                            {error && (
                                <div className="details-error">
                                    {error}
                                </div>
                            )}

                            <div className="details-grid">

                                <div className="details-main-column">

                                    <div className="detail-card">
                                        <div className="detail-card-heading">
                                            <h3>{ticket.subject}</h3>
                                            <span className="category-tag">
                                                {formatLabel(ticket.category)}
                                            </span>
                                        </div>

                                        <div className="customer-info">
                                            <div className="customer-info-item">
                                                <User size={17} />
                                                <div>
                                                    <span>Customer</span>
                                                    <strong>{ticket.customer_name}</strong>
                                                </div>
                                            </div>

                                            <div className="customer-info-item">
                                                <Mail size={17} />
                                                <div>
                                                    <span>Email</span>
                                                    <strong>{ticket.customer_email}</strong>
                                                </div>
                                            </div>

                                            <div className="customer-info-item">
                                                <Calendar size={17} />
                                                <div>
                                                    <span>Submitted</span>
                                                    <strong>{formatDate(ticket.created_at)}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="detail-divider"></div>

                                        <h4>Customer Message</h4>
                                        <p className="customer-message">
                                            {ticket.description}
                                        </p>
                                    </div>

                                    <div className="detail-card">
                                        <div className="section-title">
                                            <Sparkles size={19} />
                                            <h3>Gemini Ticket Analysis</h3>
                                        </div>

                                        <div className="analysis-grid">
                                            <div className="analysis-item">
                                                <span>Category</span>
                                                <strong>{formatLabel(ticket.category)}</strong>
                                            </div>

                                            <div className="analysis-item">
                                                <span>Intent</span>
                                                <strong>{formatLabel(ticket.intent)}</strong>
                                            </div>

                                            <div className="analysis-item">
                                                <span>Sentiment</span>
                                                <strong className={`sentiment-value ${ticket.sentiment}`}>
                                                    {formatLabel(ticket.sentiment)}
                                                </strong>
                                            </div>

                                            <div className="analysis-item">
                                                <span>Priority</span>
                                                <strong className={`priority-badge ${ticket.priority}`}>
                                                    {formatLabel(ticket.priority)}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="detail-divider"></div>

                                        <h4>AI Summary</h4>
                                        <p className="ai-summary">
                                            {ticket.summary || "No summary available."}
                                        </p>
                                    </div>

                                    <div className="detail-card">
                                        <div className="section-title">
                                            <MessageSquare size={19} />
                                            <h3>AI Suggested Reply</h3>
                                        </div>

                                        {ticket.suggested_response ? (
                                            <>
                                                <div className="suggested-reply-box">
                                                    {ticket.suggested_response}
                                                </div>

                                                <button
                                                    className="copy-button"
                                                    onClick={copyReply}
                                                >
                                                    {copied ? (
                                                        <>
                                                            <Check size={16} />
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={16} />
                                                            Copy Reply
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <p className="no-reply">
                                                No suggested reply generated yet.
                                            </p>
                                        )}

                                        <button
                                            className="generate-button"
                                            onClick={generateReply}
                                            disabled={generating}
                                        >
                                            <Sparkles size={16} />
                                            {generating
                                                ? "Generating..."
                                                : ticket.suggested_response
                                                    ? "Regenerate Reply"
                                                    : "Generate AI Reply"}
                                        </button>

                                        <p className="reply-note">
                                            Review the AI-generated reply before sending it to the customer.
                                        </p>
                                    </div>

                                </div>

                                <div className="details-side-column">

                                    <div className="detail-card status-card">
                                        <h3>Ticket Management</h3>

                                        <label htmlFor="ticket-status">
                                            Ticket Status
                                        </label>

                                        <select
                                            id="ticket-status"
                                            className="status-select"
                                            value={ticket.status}
                                            onChange={(e) => updateStatus(e.target.value)}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>

                                        <div className="detail-divider"></div>

                                        <div className="management-info">
                                            <span>Priority</span>
                                            <strong className={`priority-badge ${ticket.priority}`}>
                                                {formatLabel(ticket.priority)}
                                            </strong>
                                        </div>

                                        <div className="management-info">
                                            <span>Last Updated</span>
                                            <strong>{formatDate(ticket.updated_at)}</strong>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </>
                    ) : (
                        <div className="ticket-message">
                            Ticket not found.
                        </div>
                    )}

                </section>
            </main>
        </div>
    );
}

export default TicketDetails;
