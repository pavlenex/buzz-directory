import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrganizationSite = repositoryName.endsWith(".github.io");
const configuredBasePath = process.env.PAGES_BASE_PATH?.trim();
const automaticBasePath =
  process.env.GITHUB_ACTIONS === "true" && !isUserOrOrganizationSite
    ? `/${repositoryName}`
    : "";
const pagesBasePath =
  configuredBasePath === "/"
    ? ""
    : configuredBasePath || automaticBasePath;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: pagesBasePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
