'use client'

import { useId, useState } from 'react'
import Icon from './Icon'

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  trailing
}: {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string | null
  autoComplete?: string
  trailing?: React.ReactNode
}) => {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && showPassword ? 'text' : type

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
        >
          {label}
        </label>
        {trailing}
      </div>
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-xl bg-surface-container-low px-4 font-body text-[15px] text-on-surface outline-none placeholder:text-outline/60 focus:ring-2 focus:ring-primary/10"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-outline"
          >
            <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
          </button>
        )}
      </div>
      {error && <p className="text-[13px] text-error">{error}</p>}
    </div>
  )
}

export default Input
