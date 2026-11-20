
export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-[#252525] rounded-md ${className}`}
    />
  );
}
