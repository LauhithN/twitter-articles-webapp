// Reusable glass button component

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'icon';
  className?: string;
}

export function GlassButton({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  className = '',
}: GlassButtonProps) {
  const baseClasses = `
    glass-highlight
    transition-glass
    hover:bg-white/10
    active:scale-95
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:hover:scale-100
  `;

  const variantClasses = {
    default: 'px-4 py-2 rounded-xl text-sm text-white/90',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
