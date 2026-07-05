import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import CourtsList from "./pages/CourtsList";
import CourtDetail from "./pages/CourtDetail";
import MyBookings from "./pages/MyBookings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<CourtsList />} />
          <Route path="/courts/:courtId" element={<CourtDetail />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  );
}
