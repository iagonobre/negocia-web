type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-50 text-purple-700',
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
