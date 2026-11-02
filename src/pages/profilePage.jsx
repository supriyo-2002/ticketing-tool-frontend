// src/pages/profilePage.jsx

import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../api/profile.js";

const inputClass =
  "w-full rounded-xl border border-[#263653] bg-[#0b1427] px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-70";

const labelClass = "mb-2 block text-xs font-semibold text-slate-400";

function normalizeProfile(response) {
  const root = response?.data ?? response?.profile ?? response?.user ?? response ?? {};
  const user = root?.user ?? root?.profile ?? root;
  const organization = user?.organization ?? user?.organisation ?? {};

  return {
    fullName:
      user?.full_name ?? user?.fullName ?? user?.name ?? user?.username ?? "",
    email: user?.email ?? user?.email_address ?? "",
    organizationName:
      user?.organization_name ??
      user?.organizationName ??
      user?.organisation_name ??
      organization?.name ??
      "",
    role: user?.role ?? user?.user_role ?? "",
    createdAt: user?.created_at ?? user?.createdAt ?? "",
  };
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState({
    fullName: "",
    organizationName: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const response = await getMyProfile();
        const user = normalizeProfile(response);

        if (active) {
          setProfile(user);
          setDraft({
            fullName: user.fullName,
            organizationName: user.organizationName,
          });
        }
      } catch (err) {
        if (active) {
          setError(
            err?.message || "Unable to load your profile. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function startEditing() {
    setDraft({
      fullName: profile.fullName,
      organizationName: profile.organizationName,
    });
    setError("");
    setSuccess("");
    setEditing(true);
  }

  function cancelEditing() {
    setDraft({
      fullName: profile.fullName,
      organizationName: profile.organizationName,
    });
    setEditing(false);
    setError("");
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const fullName = draft.fullName.trim();
    const organizationName = draft.organizationName.trim();

    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const response = await updateMyProfile({
        fullName,
        organizationName,
      });

      // Use the updated values returned by the API, when available.
      const returnedProfile = normalizeProfile(response);

      setProfile((current) => ({
        ...current,
        fullName: returnedProfile.fullName || fullName,
        organizationName:
          returnedProfile.organizationName || organizationName,
        email: returnedProfile.email || current.email,
        role: returnedProfile.role || current.role,
        createdAt: returnedProfile.createdAt || current.createdAt,
      }));

      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err?.message || "Unable to save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-slate-400">Loading profile...</div>
    );
  }

  if (!profile) {
    return (
      <section className="rounded-2xl border border-[#1f2d48] bg-[#101b31] p-6 text-slate-100">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="mt-3 text-sm text-rose-300">{error}</p>
        <p className="mt-2 text-sm text-slate-400">
          Check that your backend profile endpoint is configured correctly.
        </p>
      </section>
    );
  }

  const initials = (profile.fullName || profile.email || "U")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <main className="min-h-full text-slate-100">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Account settings
          </p>
          <h1 className="mt-2 text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-sm text-slate-400">
            View and manage your personal and organization information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="rounded-xl bg-[#4d67f6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5c75ff]"
          >
            ✎ Edit profile
          </button>
        )}
      </div>

      {success && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          {success}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-[#1f2d48] bg-[#101b31]">
          <div className="border-b border-[#1f2d48] bg-gradient-to-r from-[#142342] to-[#101b31] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4d67f6] text-xl font-bold">
                {initials || "U"}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold">
                  {profile.fullName || "Your name"}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-400">
                  {profile.email || "Email not provided"}
                </p>
                <span className="mt-3 inline-block rounded-full bg-blue-400/10 px-3 py-1 text-xs capitalize text-blue-300">
                  {profile.role || "Role not provided"}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
              <div>
                <label className={labelClass} htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  className={inputClass}
                  value={editing ? draft.fullName : profile.fullName}
                  onChange={(event) =>
                    setDraft({ ...draft, fullName: event.target.value })
                  }
                  readOnly={!editing}
                  required={editing}
                  maxLength={120}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  className={inputClass}
                  value={profile.email || "Not provided"}
                  readOnly
                  disabled
                />
                <p className="mt-2 text-xs text-slate-500">
                  Email address cannot be changed here.
                </p>
              </div>

              <div>
                <label className={labelClass} htmlFor="organizationName">
                  Organization name
                </label>
                <input
                  id="organizationName"
                  className={inputClass}
                  value={
                    editing
                      ? draft.organizationName
                      : profile.organizationName
                  }
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      organizationName: event.target.value,
                    })
                  }
                  readOnly={!editing}
                  maxLength={160}
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="role">
                  Role
                </label>
                <input
                  id="role"
                  className={inputClass}
                  value={profile.role || "Not provided"}
                  readOnly
                  disabled
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="createdAt">
                  Account created date
                </label>
                <input
                  id="createdAt"
                  className={inputClass}
                  value={formatDate(profile.createdAt)}
                  readOnly
                  disabled
                />
              </div>
            </div>

            {editing && (
              <div className="flex flex-col-reverse gap-3 border-t border-[#1f2d48] bg-[#0c1629]/70 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-xl border border-[#30415f] px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-[#1a2942] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#4d67f6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5c75ff] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            )}
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[#1f2d48] bg-[#101b31] p-6">
            <h2 className="font-semibold">Account overview</h2>
            <p className="mt-1 text-xs text-slate-500">
              Your account at a glance
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between gap-4 border-b border-[#1f2d48] pb-4">
                <span className="text-sm text-slate-400">Status</span>
                <span className="text-sm font-medium text-emerald-300">
                  Active
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b border-[#1f2d48] pb-4">
                <span className="text-sm text-slate-400">Organization</span>
                <span className="break-words text-right text-sm font-medium">
                  {profile.organizationName || "Not provided"}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-400">Member since</span>
                <span className="text-right text-sm font-medium">
                  {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#1f2d48] bg-[#101b31] p-6">
            <h2 className="font-semibold">Profile privacy</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your email address and role are read-only. You can edit your
              full name and organization name.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}