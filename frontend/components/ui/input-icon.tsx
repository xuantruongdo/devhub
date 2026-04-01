import { Input } from "./input";

interface InputIconProps extends React.ComponentProps<"input"> {
  icon: React.ReactNode;
  "aria-invalid"?: boolean;
}

function InputIcon({ icon, className, ...props }: InputIconProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-muted-foreground">
        {icon}
      </span>
      <Input className={`pl-8 ${className ?? ""}`} {...props} />
    </div>
  );
}

export { InputIcon };
