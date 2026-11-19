
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Ticket,
    Search,
    Headphones,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import api from "../services/api";
import "../App.css";

function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const navigate = useNavigate();

    const fetchTickets = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("tickets/");

            const data = response.data;
            setTickets(Array.isArray(data) ? data : data.results || []);

        } catch (err) {
            console.error(err);
            setError("Unable to load tickets. Please check your backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    
    const filteredTickets = tickets.filter((ticket) => {
        const searchText = search.toLowerCase().trim();

        const customerName = (ticket.customer_name || "").toLowerCase();
        const subject = (ticket.subject || "").toLowerCase();
        const email = (ticket.customer_email || "").toLowerCase();

        const matchesSearch =
            customerName.includes(searchText) ||
            subject.includes(searchText) ||
            email.includes(searchText);

        const matchesStatus =
            statusFilter === "all" ||
            (ticket.status || "").toLowerCase() === statusFilter;

        const matchesPriority =
            priorityFilter === "all" ||
            (ticket.priority || "").toLowerCase() === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatLabel = (value) => {
        if (!value) return "Unknown";

        return value
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
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
                        Workspace <span>/</span> Tickets
                    </div>

                </header>

                <section className="dashboard-content">

                    <div className="page-heading">
                        <div>
                            <h1>Tickets</h1>
                            <p>View and manage customer support tickets.</p>
                        </div>

                        <button
                            className="refresh-button"
                            onClick={fetchTickets}
                            disabled={loading}
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>

                    <div className="ticket-summary">
                        <div>
                            <strong>{tickets.length}</strong>
                            <span>Total tickets</span>
                        </div>

                        <div>
                            <strong>
                                {tickets.filter(t => t.status === "open").length}
                            </strong>
                            <span>Open tickets</span>
                        </div>

                        <div>
                            <strong>
                                {tickets.filter(t => t.priority === "high").length}
                            </strong>
                            <span>High priority</span>
                        </div>
                    </div>

                    <div className="ticket-filters">

                        <div className="filter-search">
                            <Search size={17} />
                            <input
                                type="text"
                                placeholder="Search by subject, customer or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="all">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                    </div>

                    <div className="ticket-table-panel">

                        <div className="ticket-table-heading">
                            <h3>All Tickets</h3>
                            <span>{filteredTickets.length} results</span>
                        </div>

                        {loading ? (
                            <div className="ticket-message">
                                Loading tickets...
                            </div>
                        ) : error ? (
                            <div className="ticket-message ticket-error">
                                <AlertCircle size={19} />
                                {error}
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="ticket-message">
                                No tickets found.
                            </div>
                        ) : (
                            <div className="table-scroll">
                                <table className="tickets-table">

                                    <thead>
                                        <tr>
                                            <th>Ticket</th>
                                            <th>Customer</th>
                                            <th>Category</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredTickets.map((ticket) => (
                                            <tr
                                                key={ticket.id}
                                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                                className="clickable-ticket-row"
                                            >
                                                <td>
                                                    <strong>{ticket.subject}</strong>
                                                    <span className="ticket-id">
                                                        #{ticket.id.slice(0, 8)}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong>{ticket.customer_name}</strong>
                                                    <span className="customer-email">
                                                        {ticket.customer_email}
                                                    </span>
                                                </td>

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

                                                <td className="ticket-date">
                                                    {formatDate(ticket.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        )}

                    </div>

                </section>

            </main>
        </div>
    );
}

export default Tickets;