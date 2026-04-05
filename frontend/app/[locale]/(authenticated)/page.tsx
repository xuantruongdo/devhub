import Feed from "@/components/Feed";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

export default function Home() {
  return (
    <div className="h-full flex overflow-hidden">
      <LeftSidebar />
      <Feed />
      <RightSidebar />
    </div>
  );
}
