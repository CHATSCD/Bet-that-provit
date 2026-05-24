'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#00FF88] text-black font-bold hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] active:scale-95',
  secondary: 'bg-[#00CFFF] text-black font-bold hover:shadow-[0_0_30px_rgba(0,207,255,0.6)] active:scale-95',
  danger:    'bg-[#FF003C] text-white font-bold hover:shadow-[0_0_30px_rgba(255,0,60,0.6)] active:scale-95',
  ghost:     'bg-transparent text-[#00FF88] border border-[#00FF88] hover:bg-[rgba(0,255,136,0.1)] active:scale-95',
  outline:   'bg-transparent text-white border border-[#1a1a1a] hover:border-[#333] active:scale-95',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs tracking-widest',
  md: 'px-6 py-3 text-sm tracking-widest',
  lg: 'px-8 py-4 text-base tracking-widest',
  xl: 'px-10 py-5 text-lg tracking-widest',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'font-ops uppercase transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled || loading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : children}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
