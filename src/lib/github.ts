export interface GitHubUserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
}

export interface GitHubRepoInfo {
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
  stargazers_count: number;
  topics: string[];
  license: { spdx_id: string | null } | null;
  size: number;
  owner: { login: string };
}

export function parseGitHubRepoUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  const match =
    trimmed.match(/github\.com\/([^/]+)\/([^/#?]+)/i) ??
    trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export async function fetchGitHubUser(
  username: string,
): Promise<GitHubUserProfile> {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
  if (!res.ok) {
    throw new Error("GitHub user not found. Check the username.");
  }
  return res.json() as Promise<GitHubUserProfile>;
}

export async function fetchGitHubRepo(
  owner: string,
  repo: string,
): Promise<GitHubRepoInfo> {
  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
  if (!res.ok) {
    throw new Error("Repository not found or private. Use a public GitHub repo.");
  }
  return res.json() as Promise<GitHubRepoInfo>;
}

export function mapLicense(spdx: string | null | undefined): "MIT" | "Apache-2.0" | "Commercial" | "CC-BY-4.0" {
  if (spdx === "MIT") return "MIT";
  if (spdx === "Apache-2.0") return "Apache-2.0";
  if (spdx === "CC-BY-4.0") return "CC-BY-4.0";
  return "MIT";
}
