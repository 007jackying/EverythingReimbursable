import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow viewing the dev server from LAN devices (e.g. testing on a phone)
  allowedDevOrigins: ['192.168.1.9']
}

export default nextConfig
