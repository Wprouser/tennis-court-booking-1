import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signIn } from "../lib/authClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn.email({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message || "Could not sign in");
      return;
    }
    navigate("/");
  }

  return (
    <div className="page auth-page">
      <h1>Sign in</h1>
      <p className="muted">Sign in to book courts and manage your reservations.</p>
      {error && <div className="banner error">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="search-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="search-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="muted">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
