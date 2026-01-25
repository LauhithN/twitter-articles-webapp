// Gradient avatars with initials - Server Component

interface AuthorAvatarProps {
  name: string | null;
  username: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Generate consistent gradient from username
function getAvatarGradient(username: string): string {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-violet-600',
    'from-amber-500 to-orange-600',
    'from-lime-500 to-green-600',
  ];
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export function AuthorAvatar({ name, username, size = 'md' }: AuthorAvatarProps) {
  const initial = name?.charAt(0)?.toUpperCase() || username?.charAt(0)?.toUpperCase() || '?';
  const gradient = getAvatarGradient(username || 'default');

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br ${gradient}
        rounded-full
        flex items-center justify-center
        font-mono font-semibold text-white
        ring-2 ring-surface-1
        shadow-[0_0_0_1px_rgba(255,255,255,0.1)]
        flex-shrink-0
      `}
    >
      {initial}
    </div>
  );
}
