
import { useEffect, useState } from "react";

import {
    LayoutDashboard,
    Ticket,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Headphones,
    ArrowUpRight,
    CircleDot,
    ChevronRight,
    LogOut
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../App.css";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [recentTickets, setRecentTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Logout functionality
    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("dashboard/");
            setDashboard(response.data);

            try {
                const ticketResponse = await api.get("tickets/");
                const data = ticketResponse.data;

                const ticketList = Array.isArray(data)
                    ? data
                    : data.results || [];

                setRecentTickets(ticketList.slice(0, 5));
            } catch (ticketError) {
                console.error("Unable to load recent tickets:", ticketError);
                setRecentTickets([]);
            }

        } catch (err) {
            console.error(err);
            setError(
                "Unable to load dashboard data. Please check whether Django is running."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const categoryData = dashboard?.category_statistics || [];
    const priorityData = dashboard?.priority_statistics || [];
    const statusData = dashboard?.status_statistics || {};

    const maxCategoryCount = Math.max(
        ...categoryData.map((item) => item.count),
        1
    );

    const formatLabel = (value) => {
        if (!value) return "Unknown";

        return value
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatDate = (date) => {
        if (!date) return "Unknown";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const cards = [
        {
            title: "Total Tickets",
            value: dashboard?.total_tickets ?? 0,
            icon: Ticket,
            color: "blue",
            note: "All customer tickets"
        },
        {
            title: "Open Tickets",
            value: statusData.open ?? 0,
            icon: Clock,
            color: "orange",
            note: "Awaiting attention"
        },
        {
            title: "In Progress",
            value: statusData.in_progress ?? 0,
            icon: RefreshCw,
            color: "purple",
            note: "Currently being handled"
        },
        {
            title: "Resolved Tickets",
            value: statusData.resolved ?? 0,
            icon: CheckCircle,
            color: "green",
            note: "Successfully resolved"
        }
    ];

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

                    <Link to="/" className="nav-item active">
                        <LayoutDashboard size={19} />
                        <span>Dashboard</span>
                    </Link>

                    <Link to="/tickets" className="nav-item">
                        <Ticket size={19} />
                        <span>Tickets</span>
                    </Link>

                    <button
                        className="nav-item logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            <main className="main-content">

                <header className="topbar">
                    <div className="breadcrumb">
                        Workspace <span>/</span> Dashboard
                    </div>
                </header>

                <section className="dashboard-content">

                    <div className="page-heading">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Welcome back! Here's your support overview.</p>
                        </div>

                        <button
                            className="refresh-button"
                            onClick={fetchDashboard}
                            disabled={loading}
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>

                    {loading ? (
                        <div className="message-card">
                            Loading dashboard data...
                        </div>
                    ) : error ? (
                        <div className="message-card error-message">
                            <AlertTriangle size={20} />
                            {error}
                            <button onClick={fetchDashboard}>
                                Try again
                            </button>
                        </div>
                    ) : (
                        <>

                            <div className="stats-grid">
                                {cards.map((card) => {
                                    const Icon = card.icon;

                                    return (
                                        <div
                                            className="stat-card"
                                            key={card.title}
                                        >
                                            <div className="stat-top">
                                                <span>{card.title}</span>

                                                <div className={`stat-icon ${card.color}`}>
                                                    <Icon size={20} />
                                                </div>
                                            </div>

                                            <h2>{card.value}</h2>
                                            <p>{card.note}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="priority-banner">
                                <div className="priority-banner-icon">
                                    <AlertTriangle size={21} />
                                </div>

                                <div>
                                    <strong>
                                        {dashboard.high_priority_tickets} High Priority Tickets
                                    </strong>
                                    <p>
                                        These tickets may require immediate attention.
                                    </p>
                                </div>
                            </div>

                            <div className="analytics-grid">

                                <div className="panel category-panel">
                                    <div className="panel-heading">
                                        <div>
                                            <h3>Tickets by Category</h3>
                                            <p>Distribution of customer issues</p>
                                        </div>
                                        <TrendingUp size={20} />
                                    </div>

                                    {categoryData.length === 0 ? (
                                        <p className="empty-message">
                                            No category data available.
                                        </p>
                                    ) : (
                                        <div className="category-list">
                                            {categoryData.map((item) => (
                                                <div
                                                    className="category-item"
                                                    key={item.category}
                                                >
                                                    <div className="category-info">
                                                        <span>
                                                            {formatLabel(item.category)}
                                                        </span>
                                                        <strong>{item.count}</strong>
                                                    </div>

                                                    <div className="progress-track">
                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${(item.count / maxCategoryCount) * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="panel">
                                    <div className="panel-heading">
                                        <div>
                                            <h3>Ticket Priority</h3>
                                            <p>Priority-wise distribution</p>
                                        </div>
                                        <CircleDot size={20} />
                                    </div>

                                    <div className="priority-list">
                                        {["high", "medium", "low"].map((priority) => {
                                            const item = priorityData.find(
                                                (entry) => entry.priority === priority
                                            );

                                            return (
                                                <div
                                                    className="priority-row"
                                                    key={priority}
                                                >
                                                    <div className="priority-label">
                                                        <span className={`priority-dot ${priority}`} />
                                                        <span>{formatLabel(priority)}</span>
                                                    </div>

                                                    <strong>{item?.count ?? 0}</strong>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="status-divider" />

                                    <h4 className="status-title">Ticket Status</h4>

                                    <div className="status-list">
                                        <div>
                                            <span>Open</span>
                                            <strong>{statusData.open ?? 0}</strong>
                                        </div>

                                        <div>
                                            <span>In Progress</span>
                                            <strong>{statusData.in_progress ?? 0}</strong>
                                        </div>

                                        <div>
                                            <span>Resolved</span>
                                            <strong>{statusData.resolved ?? 0}</strong>
                                        </div>

                                        <div>
                                            <span>Closed</span>
                                            <strong>{statusData.closed ?? 0}</strong>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="recent-tickets-panel">
                                <div className="recent-tickets-heading">
                                    <div>
                                        <h3>Recent Tickets</h3>
                                        <p>Latest customer support requests</p>
                                    </div>

                                    <Link to="/tickets" className="view-all-link">
                                        View all tickets
                                        <ChevronRight size={16} />
                                    </Link>
                                </div>

                                {recentTickets.length === 0 ? (
                                    <div className="recent-empty">
                                        No recent tickets available.
                                    </div>
                                ) : (
                                    <div className="recent-table-scroll">
                                        <table className="recent-tickets-table">
                                            <thead>
                                                <tr>
                                                    <th>Ticket</th>
                                                    <th>Customer</th>
                                                    <th>Category</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th></th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {recentTickets.map((ticket) => (
                                                    <tr
                                                        key={ticket.id}
                                                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                    >
                                                        <td>
                                                            <strong>{ticket.subject}</strong>
                                                            <span>
                                                                #{ticket.id.slice(0, 8)}
                                                            </span>
                                                        </td>

                                                        <td>{ticket.customer_name}</td>

                                                        <td>
                                                            <span className="category-tag">
                                                                {formatLabel(ticket.category)}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className={`priority-badge ${ticket.priority}`}>
                                                                {formatLabel(ticket.priority)}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className={`status-badge ${ticket.status}`}>
                                                                {formatLabel(ticket.status)}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {formatDate(ticket.created_at)}
                                                        </td>

                                                        <td>
                                                            <ArrowUpRight size={16} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="dashboard-footer">
                                <span>ResolveAI Support Intelligence</span>
                                <span>
                                    <ArrowUpRight size={14} />
                                    Live database statistics
                                </span>
                            </div>

                        </>
                    )}

                </section>
            </main>
        </div>
    );
}

export default Dashboard;
