import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const config = [
  ...coreWebVitals,
  ...typescript,
  { ignores: ['node_modules/**', '.next/**', 'designMockups/**'] },
  {
    rules: {
      // Fires on the standard hydrate-from-localStorage/URL-on-mount pattern,
      // which is legitimate external-system sync — not derived state.
      'react-hooks/set-state-in-effect': 'off'
    }
  }
]

export default config
