import Feed from "@/components/Feed";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

export default function Home() {
  return (
    <div className="h-[calc(100dvh-66px)] flex overflow-hidden">
      <LeftSidebar />
      <Feed />
      <RightSidebar />
    </div>
  );
}
