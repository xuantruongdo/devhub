import { UserRole } from "@/constants";
import { cn } from "@/lib/utils";

type RoleBadgeProps = {
  role: UserRole;
};

const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-medium capitalize",
        getRoleBadgeColor(role),
      )}
    >
      {role}
    </span>
  );
}
