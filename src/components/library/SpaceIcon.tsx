import { BookOpen, BriefcaseBusiness, Folder, Inbox, Rocket, Sprout } from "lucide-react";

const icons = { rocket: Rocket, briefcase: BriefcaseBusiness, book: BookOpen, sprout: Sprout, folder: Folder, inbox: Inbox } as const;
type SpaceIconProps = { icon: string; size?: number };

export default function SpaceIcon({ icon, size = 14 }: SpaceIconProps) {
  const Icon = icons[icon as keyof typeof icons] ?? Sprout;
  return <Icon size={size} strokeWidth={1.7} />;
}
