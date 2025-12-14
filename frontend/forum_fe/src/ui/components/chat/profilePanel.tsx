import {
  User,
  Link2,
  BellOff,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

interface ProfilePanelProps {
  name: string;
  avatar: string;
}

const ProfilePanel = ({ name, avatar }: ProfilePanelProps) => {
  const actions = [
    { icon: User, label: "View Profile" },
    { icon: Link2, label: "Attachment" },
    { icon: BellOff, label: "Mute" },
    { icon: MessageCircle, label: "Block" },
    { icon: AlertTriangle, label: "Report" },
  ];

  return (
    <div className="w-72 bg-white/15 p-6 flex flex-col items-center rounded-2xl">
      {/* Avatar */}
      <div className="relative mb-6">
        <img
          src={avatar}
          alt={name}
          className="w-32 h-32 rounded-full object-cover border-4 border-primary/30"
        />
      </div>

      {/* Name */}
      <h3 className="text-2xl font-bold text-foreground text-center mb-8">
        {name}
      </h3>

      {/* Actions */}
      <div className="w-full space-y-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="w-full flex items-center gap-4 px-5 py-3 bg-black hover:bg-black/50 rounded-xl transition-colors group"
          >
            <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfilePanel;
