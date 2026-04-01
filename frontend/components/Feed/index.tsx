import ComposePost from "../ComposePost";
import Post from "../Post";

const fakePosts = [
  {
    author: {
      name: "Sarah Johnson",
      handle: "@sarahjohnson",
      avatar: "",
      isVerified: true,
    },
    content:
      "Just launched my new project! Really excited to share it with everyone. Thank you for all your support 🚀",
    timestamp: "2h",
    likes: 1250,
    comments: 342,
    shares: 189,
  },
  {
    author: {
      name: "Alex Chen",
      handle: "@alexchen",
      avatar: "",
      isVerified: false,
    },
    content:
      "Beautiful day for coffee with friends. Life is amazing when you have the right people by your side ☕",
    timestamp: "4h",
    likes: 856,
    comments: 245,
    shares: 120,
  },
  {
    author: {
      name: "Michael Park",
      handle: "@michaelpark_dev",
      avatar: "",
      isVerified: true,
    },
    content:
      "Started learning React today. This is such a powerful and interesting technology. Anyone with experience want to help?",
    timestamp: "5h",
    likes: 523,
    comments: 178,
    shares: 89,
  },
  {
    author: {
      name: "Emma Wilson",
      handle: "@emmawilson",
      avatar: "",
      isVerified: false,
    },
    content:
      "Where do you guys like to travel? I love exploring new places and discovering hidden gems 🌍",
    timestamp: "6h",
    likes: 2341,
    comments: 567,
    shares: 298,
  },
  {
    author: {
      name: "David Lee",
      handle: "@davidlee_code",
      avatar: "",
      isVerified: true,
    },
    content:
      "Programming tip: Always write clean and readable code. Code is not just for computers, but for other developers too 💻",
    timestamp: "8h",
    likes: 1876,
    comments: 421,
    shares: 234,
  },
  {
    author: {
      name: "David Lee",
      handle: "@davidlee_code",
      avatar: "",
      isVerified: true,
    },
    content:
      "Programming tip: Always write clean and readable code. Code is not just for computers, but for other developers too 💻",
    timestamp: "8h",
    likes: 1876,
    comments: 421,
    shares: 234,
  },
  {
    author: {
      name: "David Lee",
      handle: "@davidlee_code",
      avatar: "",
      isVerified: true,
    },
    content:
      "Programming tip: Always write clean and readable code. Code is not just for computers, but for other developers too 💻",
    timestamp: "8h",
    likes: 1876,
    comments: 421,
    shares: 234,
  },
  {
    author: {
      name: "David Lee",
      handle: "@davidlee_code",
      avatar: "",
      isVerified: true,
    },
    content:
      "Programming tip: Always write clean and readable code. Code is not just for computers, but for other developers too 💻",
    timestamp: "8h",
    likes: 1876,
    comments: 421,
    shares: 234,
  },
  {
    author: {
      name: "David Lee",
      handle: "@davidlee_code",
      avatar: "",
      isVerified: true,
    },
    content:
      "Programming tip: Always write clean and readable code. Code is not just for computers, but for other developers too 💻",
    timestamp: "8h",
    likes: 1876,
    comments: 421,
    shares: 234,
  },
  {
    author: {
      name: "David Lee",
      handle: "@davidlee_code",
      avatar: "",
      isVerified: true,
    },
    content:
      "Programming tip: Always write clean and readable code. Code is not just for computers, but for other developers too 💻",
    timestamp: "8h",
    likes: 1876,
    comments: 421,
    shares: 234,
  },
];

export default function Feed() {
  return (
    <div className="flex-1 border-r border-border bg-card overflow-y-auto flex flex-col">
      <ComposePost />

      <div>
        {fakePosts.map((post, index) => (
          <Post key={index} {...post} />
        ))}
      </div>
    </div>
  );
}
