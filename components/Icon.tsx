const Icon = ({
  name,
  filled = false,
  size = 24,
  className = ''
}: {
  name: string
  filled?: boolean
  size?: number
  className?: string
}) => (
  <span
    aria-hidden
    className={`${filled ? 'material-symbols-filled' : 'material-symbols-outlined'} shrink-0 select-none ${className}`}
    style={{ fontSize: size }}
  >
    {name}
  </span>
)

export default Icon
