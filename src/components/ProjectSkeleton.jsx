
import Skeleton from "./Skeleton";

export default function ProjectsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 p-4 rounded-xl border border-[#292929]"
        >
          <Skeleton className="w-12 h-12 rounded-lg" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>

          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
