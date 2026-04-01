"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "./input";

interface InputPasswordProps extends Omit<
  React.ComponentProps<"input">,
  "type"
> {
  "aria-invalid"?: boolean;
}

function InputPassword({ className, ...props }: InputPasswordProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-muted-foreground">
        <Lock className="h-4 w-4" />
      </span>
      <Input
        type={show ? "text" : "password"}
        className={`pl-8 pr-9 ${className ?? ""}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
        className="absolute inset-y-0 right-2.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export { InputPassword };
