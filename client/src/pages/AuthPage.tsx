import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";

export function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@finora.app");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register({ name, email, password });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not continue.");
    } finally {
      setLoading(false);
    }
  }

  function useDemo() {
    setMode("login");
    setEmail("demo@finora.app");
    setPassword("demo1234");
  }

  return (
    <main className="auth-layout">
      <section className="auth-showcase">
        <div className="auth-brand"><Logo /><span>Personal finance, thoughtfully reimagined.</span></div>
        <div className="auth-copy"><span className="eyebrow light"><Sparkles size={14} /> AI-guided clarity</span><h1>Know where your money is going—<em>before it gets there.</em></h1><p>Finora turns everyday transactions into calm, useful direction. Plan better, spend with intention, and grow the gap.</p><ul><li><Check size={15} />Private by design</li><li><Check size={15} />Helpful, human insights</li><li><Check size={15} />Built around your month</li></ul></div>
        <div className="auth-preview"><div className="preview-glow" /><div className="preview-card main"><div><span>Available this month</span><strong>Rs. 186,100</strong><small><TrendingUp size={14} /> 11.4% better than July</small></div><div className="mini-chart"><i /><i /><i /><i /><i /><i /></div></div><div className="preview-card insight"><span><Sparkles size={16} /></span><div><small>FINORA SIGNAL</small><strong>You’re on track to save 38% this month.</strong></div></div></div>
        <footer><ShieldCheck size={16} /> Your financial data belongs to you.</footer>
      </section>
      <section className="auth-form-section">
        <div className="mobile-auth-logo"><Logo /></div>
        <div className="auth-form-card">
          <span className="auth-icon"><LockKeyhole size={22} /></span>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>{mode === "login" ? "Sign in to pick up where you left off." : "Start building a healthier relationship with money."}</p>
          <div className="auth-switch"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button></div>
          <form className="form-stack auth-form" onSubmit={submit}>
            {mode === "register" && <label className="field">Full name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" required /></label>}
            <label className="field">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
            <label className="field password-field"><span>Password{mode === "login" && <button type="button">Forgot?</button>}</span><div><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : 1} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button primary auth-submit" disabled={loading}>{loading ? "Opening Finora…" : mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={18} /></button>
          </form>
          <div className="demo-access"><span>Portfolio preview</span><p>Explore with a ready-made financial workspace.</p><button type="button" onClick={useDemo}>Use demo account <ArrowRight size={15} /></button></div>
        </div>
        <p className="auth-legal">By continuing, you agree to Finora’s Terms and Privacy Notice.</p>
      </section>
    </main>
  );
}

