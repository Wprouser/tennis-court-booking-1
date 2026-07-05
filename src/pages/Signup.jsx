import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../lib/authClient";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signUpError } = await signUp.email({ name, email, password });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message || "Could not create account");
      return;
    }
    navigate("/");
  }

  return (
    <div className="page auth-page">
      <h1>Create an account</h1>
      <p className="muted">Sign up to start booking courts.</p>
      {error && <div className="banner error">{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="search-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
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
          minLength={8}
        />
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
