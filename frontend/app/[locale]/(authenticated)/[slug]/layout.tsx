import { Metadata } from "next";
import userService from "@/services/user";

type Props = {
  params: { slug: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const res = await userService.findMetadata(slug);
    const user = res.data;

    const avatarUrl = user.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${process.env.NEXT_PUBLIC_S3_DOMAIN}/${user.avatar}`
      : undefined;

    return {
      title: `${user.fullName} | DevHub`,
      description: `Profile of ${user.fullName} on DevHub.`,
      openGraph: {
        title: user.fullName,
        description: `Profile of ${user.fullName} on DevHub.`,
        images: avatarUrl ? [avatarUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: "User not found",
      description: "The user you are looking for does not exist.",
    };
  }
}

export default function ProfileLayout({ children }: Props) {
  return <>{children}</>;
}
