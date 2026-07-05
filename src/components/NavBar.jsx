import { NavLink, useNavigate } from "react-router-dom";
import { useSession, signOut } from "../lib/authClient";

export default function NavBar() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          🎾 CourtSide
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Find a Court
          </NavLink>
          <NavLink to="/bookings" className={({ isActive }) => (isActive ? "active" : "")}>
            My Bookings
          </NavLink>
          {!isPending && session && (
            <span className="nav-user">
              <span className="muted">{session.user.name || session.user.email}</span>
              <button className="btn secondary" onClick={handleSignOut}>
                Sign out
              </button>
            </span>
          )}
          {!isPending && !session && (
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
