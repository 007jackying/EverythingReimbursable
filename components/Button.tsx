'use client'

import Icon from './Icon'

type Variant = 'primary' | 'ghost'

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  arrow = false,
  className = ''
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  arrow?: boolean
  className?: string
}) => {
  const base =
    'flex w-full items-center justify-center gap-2 rounded-xl font-label text-sm font-bold tracking-wide transition-transform duration-200 active:scale-[0.98] disabled:pointer-events-none'
  const variants: Record<Variant, string> = {
    primary: 'h-14 bg-primary text-on-primary disabled:bg-surface-container-high disabled:text-on-surface-variant',
    ghost: 'h-13 border border-outline-variant/40 bg-transparent text-primary'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? 'Please wait…' : children}
      {!loading && arrow && <Icon name="arrow_forward" size={20} />}
    </button>
  )
}

export default Button
