/** @type {import('next').NextConfig} */
// `standalone` output is needed for the Docker image (Linux). It uses symlinks
// during file-tracing which Windows blocks (EPERM), so gate it behind an env var:
// the Dockerfile sets NEXT_OUTPUT=standalone; local Windows builds run without it.
const nextConfig = {
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  reactStrictMode: true,
  // Lint runs as its own CI gate (pnpm lint); don't fail the build on lint nits.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
