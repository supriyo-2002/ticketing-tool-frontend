
import { useEffect, useState } from "react";

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  ticketAssignments: true,
  projectUpdates: true,
  invitationUpdates: true,
  compactView: false,
  defaultPage: "dashboard",
};

const STORAGE_KEY = "relay_user_preferences";

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#111a2e] ${
        checked ? "bg-blue-600" : "bg-slate-600"
      }`}
    >
      <span
        className={`pointer-events-none absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({ title, description, checked, onChange }) {
  return (
    <div className="flex min-h-[65px] items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-slate-200">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}

export default function Preferences() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(stored),
        });
      }
    } catch (error) {
      console.error("Unable to load preferences:", error);
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
    setMessage("");
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setMessage("Preferences saved successfully.");
    } catch (error) {
      console.error("Unable to save preferences:", error);
      setMessage("Unable to save preferences. Please try again.");
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaved(false);
    setMessage("Default settings restored. Click Save changes to apply.");
  };

  return (
    <div className="w-full min-w-0 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400">
            Settings / Preferences
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Preferences
          </h1>

          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Customize your Relay workspace and notification settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-[#293752] px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-[#1a2942] hover:text-white"
          >
            Reset defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saved ? "Saved" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div
          role="status"
          className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400"
        >
          {message}
        </div>
      )}

      {/* Settings Grid */}
      <div className="mt-6 grid w-full grid-cols-1 gap-5 xl:grid-cols-2">

        {/* Notifications */}
        <section className="min-w-0 rounded-xl border border-[#202c46] bg-[#111a2e] px-4 sm:px-6">
          <div className="border-b border-[#202c46] py-4">
            <h2 className="text-sm font-semibold text-white">
              Notifications
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage the updates you receive from Relay.
            </p>
          </div>

          <SettingRow
            title="Email notifications"
            description="Receive workspace notifications through email."
            checked={settings.emailNotifications}
            onChange={(v) => updateSetting("emailNotifications", v)}
          />

          <div className="border-t border-[#202c46]">
            <SettingRow
              title="Ticket assignments"
              description="Get notified when a ticket is assigned to you."
              checked={settings.ticketAssignments}
              onChange={(v) => updateSetting("ticketAssignments", v)}
            />
          </div>

          <div className="border-t border-[#202c46]">
            <SettingRow
              title="Project updates"
              description="Receive notifications about project changes."
              checked={settings.projectUpdates}
              onChange={(v) => updateSetting("projectUpdates", v)}
            />
          </div>

          <div className="border-t border-[#202c46]">
            <SettingRow
              title="Invitation updates"
              description="Stay updated about invitations and their status."
              checked={settings.invitationUpdates}
              onChange={(v) => updateSetting("invitationUpdates", v)}
            />
          </div>
        </section>

        {/* Display & Workspace */}
        <section className="min-w-0 rounded-xl border border-[#202c46] bg-[#111a2e] px-4 sm:px-6">
          <div className="border-b border-[#202c46] py-4">
            <h2 className="text-sm font-semibold text-white">
              Display & Workspace
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Adjust how your workspace looks and opens.
            </p>
          </div>

          <SettingRow
            title="Compact view"
            description="Reduce spacing to display more information."
            checked={settings.compactView}
            onChange={(v) => updateSetting("compactView", v)}
          />

          <div className="border-t border-[#202c46] py-4">
            <label
              htmlFor="defaultPage"
              className="text-sm font-medium text-slate-200"
            >
              Default landing page
            </label>

            <p className="mt-1 text-xs text-slate-500">
              Select the page displayed when you open Relay.
            </p>

            <select
              id="defaultPage"
              value={settings.defaultPage}
              onChange={(e) => updateSetting("defaultPage", e.target.value)}
              className="mt-3 w-full rounded-lg border border-[#293752] bg-[#0b1427] px-3 py-2.5 text-xs text-white outline-none transition focus:border-blue-500"
            >
              <option value="dashboard">Dashboard</option>
              <option value="projects">Projects</option>
              <option value="tickets">Tickets</option>
              <option value="teams">Teams</option>
            </select>
          </div>
        </section>
      </div>

      {/* Information */}
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#202c46] bg-[#0d172a] p-4">
        <span className="text-blue-400">ⓘ</span>
        <div>
          <h3 className="text-xs font-semibold text-slate-200">
            Preference storage
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your preferences are currently stored in this browser.
            They are not yet synchronized with your Relay account.
          </p>
        </div>
      </div>
    </div>
  );
}
