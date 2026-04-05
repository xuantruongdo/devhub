import { Card } from "../ui/card";

const RightSidebarProfile = () => {
  return (
    <div className="w-72 hidden lg:flex border-l border-border bg-card flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-lg text-foreground">What's happening</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <Card className="p-4 hover:bg-secondary/50 transition cursor-pointer">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              TRENDING
            </div>
            <h3 className="font-bold text-foreground">#DesignSystem</h3>
            <p className="text-xs text-muted-foreground">145K posts</p>
          </Card>

          <Card className="p-4 hover:bg-secondary/50 transition cursor-pointer">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              TRENDING
            </div>
            <h3 className="font-bold text-foreground">#WebDesign</h3>
            <p className="text-xs text-muted-foreground">89K posts</p>
          </Card>

          <Card className="p-4 hover:bg-secondary/50 transition cursor-pointer">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              TRENDING
            </div>
            <h3 className="font-bold text-foreground">#UIUXDesign</h3>
            <p className="text-xs text-muted-foreground">234K posts</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RightSidebarProfile;
