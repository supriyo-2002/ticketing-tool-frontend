
import { useState } from "react";

export default function Preferences() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [compactView, setCompactView] = useState(false);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
        Settings / Preferences
      </p>
      <h1 className="mt-2 text-3xl font-bold">Preferences</h1>
      <p className="mt-2 text-sm text-slate-400">
        Customize your workspace experience.
      </p>

      <div className="mt-8 max-w-2xl divide-y divide-[#202943] rounded-xl border border-[#1d2944] bg-[#111d36] px-5">
        <div className="flex items-center justify-between gap-4 py-5">
          <div>
            <h2 className="text-sm font-semibold">Email notifications</h2>
            <p className="mt-1 text-xs text-slate-400">
              Enable email notification preferences.
            </p>
          </div>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(event) => setEmailNotifications(event.target.checked)}
            aria-label="Email notifications"
            className="h-4 w-4 accent-blue-500"
          />
        </div>

        <div className="flex items-center justify-between gap-4 py-5">
          <div>
            <h2 className="text-sm font-semibold">Compact view</h2>
            <p className="mt-1 text-xs text-slate-400">
              Use a more compact display preference.
            </p>
          </div>
          <input
            type="checkbox"
            checked={compactView}
            onChange={(event) => setCompactView(event.target.checked)}
            aria-label="Compact view"
            className="h-4 w-4 accent-blue-500"
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        These are demonstration settings and are not saved to a database.
      </p>
    </div>
  );
}
