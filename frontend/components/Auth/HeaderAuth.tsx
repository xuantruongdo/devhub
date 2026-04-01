import { ModeToggle } from "../ModeToggle";
import { LanguageToggle } from "../LanguageToggle";

const HeaderAuth = () => {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-border/50">
      <span className="font-semibold tracking-tight text-foreground text-lg">
        DevHub
      </span>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ModeToggle />
      </div>
    </header>
  );
};

export default HeaderAuth;
