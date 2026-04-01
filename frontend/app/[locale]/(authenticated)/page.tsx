import Feed from "@/components/Feed";
import Header from "@/components/Header";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

export default function Home() {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <Feed />
        <RightSidebar />
      </div>
    </div>
  )
}
