
// import { useState } from "react";
// import { Link } from "react-router-dom";

// export default function AcceptInvite() {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     setError("");
//     setSuccess("");

//     if (formData.fullName.trim().length < 2) {
//       setError("Please enter your full name.");
//       return;
//     }

//     if (!formData.email.trim()) {
//       setError("Please enter your email address.");
//       return;
//     }

//     if (formData.password.length < 8) {
//       setError("Your password must contain at least 8 characters.");
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       setError("Your passwords do not match.");
//       return;
//     }

//     setSuccess(
//       "Your details are valid. Invitation verification and account creation will be connected to the backend next."
//     );
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-[#080d18] px-4 py-10 text-white">
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <Link
//           to="/"
//           className="mb-8 flex items-center justify-center gap-3"
//         >
//           <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6482ff] to-[#4558df] text-2xl font-bold">
//             ✓
//           </span>

//           <span className="text-2xl font-bold tracking-tight">
//             Relay
//           </span>
//         </Link>

//         {/* Form card */}
//         <div className="rounded-2xl border border-[#202943] bg-[#0c1427] p-6 shadow-2xl sm:p-8">
//           <div className="mb-7 text-center">
//             <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-2xl text-blue-300">
//               ✉
//             </div>

//             <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
//               Team Invitation
//             </p>

//             <h1 className="mt-3 text-2xl font-bold">
//               Accept your invitation
//             </h1>

//             <p className="mt-2 text-sm leading-6 text-slate-400">
//               Complete your details to get started with your
//               workspace.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label
//                 htmlFor="fullName"
//                 className="mb-2 block text-sm font-medium text-slate-300"
//               >
//                 Full Name
//               </label>

//               <input
//                 id="fullName"
//                 name="fullName"
//                 type="text"
//                 autoComplete="name"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 placeholder="Enter your full name"
//                 className="w-full rounded-lg border border-[#293653] bg-[#080d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//                 required
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="email"
//                 className="mb-2 block text-sm font-medium text-slate-300"
//               >
//                 Work Email
//               </label>

//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="you@company.com"
//                 className="w-full rounded-lg border border-[#293653] bg-[#080d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//                 required
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="mb-2 block text-sm font-medium text-slate-300"
//               >
//                 Create Password
//               </label>

//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="new-password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 placeholder="Minimum 8 characters"
//                 minLength={8}
//                 className="w-full rounded-lg border border-[#293653] bg-[#080d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//                 required
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor="confirmPassword"
//                 className="mb-2 block text-sm font-medium text-slate-300"
//               >
//                 Confirm Password
//               </label>

//               <input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type="password"
//                 autoComplete="new-password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Re-enter your password"
//                 className="w-full rounded-lg border border-[#293653] bg-[#080d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
//                 required
//               />
//             </div>

//             {error && (
//               <p
//                 role="alert"
//                 className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
//               >
//                 {error}
//               </p>
//             )}

//             {success && (
//               <p
//                 role="status"
//                 className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm leading-6 text-emerald-300"
//               >
//                 {success}
//               </p>
//             )}

//             <button
//               type="submit"
//               className="w-full rounded-lg bg-gradient-to-r from-[#6482ff] to-[#4558df] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0c1427]"
//             >
//               Accept Invitation
//             </button>
//           </form>

//           <p className="mt-6 text-center text-sm text-slate-400">
//             Already have an account?{" "}
//             <Link
//               to="/"
//               className="font-semibold text-blue-400 hover:text-blue-300"
//             >
//               Sign in
//             </Link>
//           </p>
//         </div>

//         <p className="mt-6 text-center text-xs text-slate-600">
//           Secure access to your workspace
//         </p>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Change this to your backend URL
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const inputClass =
  "w-full rounded-2xl border border-[#1a2547] bg-[#0f1a35] px-4 py-3.5 text-base text-[#f1f5ff] outline-none placeholder:text-[#4f6190] focus:border-[#4a7cff] disabled:opacity-60 sm:px-5 sm:py-4 sm:text-lg";
const labelClass = "font-semibold text-[#9aa8d6]";
const cardClass =
  "w-full max-w-md rounded-2xl border border-[#1a2547] bg-[#0d1730] p-5 sm:rounded-3xl sm:p-8";
const buttonClass =
  "w-full rounded-2xl bg-[#4a7cff] py-3.5 text-base font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-lg";

function Screen({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1020] px-4 py-6 text-[#f1f5ff]">
      {children}
    </div>
  );
}

export default function AcceptInvitePage() {
  const { token } = useParams(); // route: /accept-invite/:token
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null); // { email, role, invitedBy }
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Check the invite link when the page opens
  useEffect(() => {
    const checkInvite = async () => {
      try {
        const res = await fetch(`${API}/invites/token/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Invalid invitation");
        setInvite(data);
      } catch (err) {
        setInvalid(err.message);
      } finally {
        setLoading(false);
      }
    };
    checkInvite();
  }, [token]);

  const handleAccept = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }
    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/invites/token/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not accept invitation");
      setDone(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <div className={`${cardClass} text-[#9aa8d6]`}>
          Checking your invitation...
        </div>
      </Screen>
    );
  }

  if (invalid) {
    return (
      <Screen>
        <div className={cardClass}>
          <h2 className="mb-2 text-xl font-semibold sm:text-2xl">
            This invitation can't be used
          </h2>
          <p className="mb-6 text-[#9aa8d6]">
            {invalid}. Ask your admin to send you a new invitation.
          </p>
          <button className={buttonClass} onClick={() => navigate("/")}>
            Go to login
          </button>
        </div>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen>
        <div className={cardClass}>
          <h2 className="mb-4 text-xl font-semibold sm:text-2xl">You're in</h2>
          <div className="rounded-xl border border-emerald-400 px-4 py-3 text-sm text-emerald-400">
            Your account is ready. Redirecting to login...
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <form onSubmit={handleAccept} className={cardClass}>
        <h2 className="mb-2 text-xl font-semibold sm:text-2xl">
          Accept invitation
        </h2>
        <p className="mb-6 text-[#9aa8d6]">
          {invite.invitedBy ? `${invite.invitedBy} invited you` : "You're invited"}{" "}
          to join as {invite.role}.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-400 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-col gap-2">
          <label htmlFor="email" className={labelClass}>Work email</label>
          <input id="email" type="email" value={invite.email} disabled className={inputClass} />
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <label htmlFor="name" className={labelClass}>Full name</label>
          <input
            id="name"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <label htmlFor="password" className={labelClass}>Password</label>
          <input
            id="password"
            type="password"
            required
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mb-6 flex flex-col gap-2">
          <label htmlFor="confirm" className={labelClass}>Confirm password</label>
          <input
            id="confirm"
            type="password"
            required
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>

        <button disabled={submitting} className={buttonClass}>
          {submitting ? "Creating account..." : "Accept invitation"}
        </button>
      </form>
    </Screen>
  );
}