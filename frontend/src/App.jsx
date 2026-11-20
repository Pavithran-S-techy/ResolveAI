
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerTicket from "./pages/CustomerTicket";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/tickets/:id" element={<TicketDetails />} />
                </Route>
                <Route path="/submit-ticket" element={<CustomerTicket />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
