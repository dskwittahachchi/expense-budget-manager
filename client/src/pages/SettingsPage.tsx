import { Bell, Check, KeyRound, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeading } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import { initials } from "../lib/format";

export function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.currency || "LKR");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await updateProfile({ name, currency });
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  return (
    <>
      <PageHeading eyebrow="Personalize Finora" title="Settings" copy="Keep your profile, display preferences, and account security up to date." />
      <div className="settings-layout"><nav className="settings-nav"><a href="#profile" className="active"><UserRound size={17} />Profile</a><a href="#preferences"><Bell size={17} />Preferences</a><a href="#security"><ShieldCheck size={17} />Security</a></nav><div className="settings-content"><section className="card settings-card" id="profile"><div className="settings-heading"><div><h2>Profile details</h2><p>The information attached to your personal workspace.</p></div><span className="profile-avatar">{initials(user?.name || "F")}</span></div><form className="settings-form" onSubmit={submit}><div className="field-grid two"><label className="field">Full name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label className="field">Email address<div className="input-with-icon"><Mail size={16} /><input value={user?.email || ""} disabled /></div></label></div><label className="field short-field">Display currency<select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)}><option value="LKR">LKR — Sri Lankan Rupee</option><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — British Pound</option><option value="INR">INR — Indian Rupee</option></select></label><div className="settings-actions">{saved && <span className="saved-message"><Check size={15} />Preferences saved</span>}<button className="button primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div></form></section><section className="card settings-card" id="preferences"><div className="settings-heading"><div><h2>Smart notifications</h2><p>Receive useful nudges, never noisy ones.</p></div></div><div className="setting-row"><span className="setting-icon"><Bell /></span><div><strong>Budget pace alerts</strong><p>Get a heads-up when a category is moving faster than planned.</p></div><button className={`toggle ${notifications ? "on" : ""}`} onClick={() => setNotifications((value) => !value)} aria-label="Toggle budget notifications"><i /></button></div></section><section className="card settings-card" id="security"><div className="settings-heading"><div><h2>Security</h2><p>Your account is protected with modern authentication.</p></div><span className="secure-pill"><ShieldCheck size={14} />Protected</span></div><div className="security-grid"><div><span className="setting-icon"><KeyRound /></span><strong>Password</strong><p>Securely hashed and never stored in plain text.</p><button>Update password</button></div><div><span className="setting-icon"><ShieldCheck /></span><strong>Private workspace</strong><p>Every finance record is isolated to your account.</p><button>Learn more</button></div></div><button className="logout-button" onClick={logout}><LogOut size={17} />Sign out of Finora</button></section></div></div>
    </>
  );
}

