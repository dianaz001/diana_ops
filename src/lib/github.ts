import { supabase } from './supabase';
import type { Entry, Category, Owner } from '../types';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  content?: string;
  type: 'file' | 'dir';
}

interface GitHubConfig {
  token: string;
  repo: string;
  owner: string;
}

// Get GitHub config from Supabase
async function getGitHubConfig(): Promise<GitHubConfig | null> {
  try {
    const { data: tokenData } = await supabase
      .from('juliz_portal_config')
      .select('value')
      .eq('key', 'github_pat')
      .single();

    const { data: repoData } = await supabase
      .from('juliz_portal_config')
      .select('value')
      .eq('key', 'github_repo')
      .single();

    if (!tokenData?.value || !repoData?.value) {
      return null;
    }

    const [owner, repo] = repoData.value.split('/');
    return {
      token: tokenData.value,
      owner,
      repo,
    };
  } catch {
    return null;
  }
}

// Parse markdown frontmatter
function parseFrontmatter(content: string): { metadata: Record<string, unknown>; content: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { metadata: {}, content };
  }

  const [, frontmatter, body] = match;
  const metadata: Record<string, unknown> = {};

  frontmatter.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const rawValue = line.slice(colonIndex + 1).trim();
      let parsedValue: unknown = rawValue;

      // Parse arrays
      if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
        parsedValue = rawValue.slice(1, -1).split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
      }
      // Parse booleans
      else if (rawValue === 'true') parsedValue = true;
      else if (rawValue === 'false') parsedValue = false;
      // Parse numbers
      else if (!isNaN(Number(rawValue)) && rawValue !== '') parsedValue = Number(rawValue);
      // Remove quotes
      else {
        parsedValue = rawValue.replace(/^["']|["']$/g, '');
      }

      metadata[key] = parsedValue;
    }
  });

  return { metadata, content: body.trim() };
}

// Generate markdown with frontmatter
function generateMarkdown(entry: Entry): string {
  const frontmatter: Record<string, unknown> = {
    title: entry.title,
    category: entry.category,
    subcategory: entry.subcategory,
    owner: entry.owner,
    tags: entry.tags,
    created: entry.created_at,
    updated: entry.updated_at,
  };

  // Add category-specific fields
  switch (entry.category) {
    case 'finance':
      if (entry.amount !== undefined) frontmatter.amount = entry.amount;
      if (entry.is_recurring !== undefined) frontmatter.is_recurring = entry.is_recurring;
      if (entry.frequency) frontmatter.frequency = entry.frequency;
      if (entry.due_date) frontmatter.due_date = entry.due_date;
      break;
    case 'taxes':
      if (entry.tax_year) frontmatter.tax_year = entry.tax_year;
      if (entry.document_type) frontmatter.document_type = entry.document_type;
      if (entry.tax_status) frontmatter.tax_status = entry.tax_status;
      break;
    case 'health':
      if (entry.health_type) frontmatter.health_type = entry.health_type;
      if (entry.appointment_date) frontmatter.appointment_date = entry.appointment_date;
      if (entry.provider) frontmatter.provider = entry.provider;
      break;
    case 'social':
      if (entry.event_date) frontmatter.event_date = entry.event_date;
      if (entry.people_involved) frontmatter.people_involved = entry.people_involved;
      if (entry.location) frontmatter.location = entry.location;
      break;
    case 'ideas':
      if (entry.idea_status) frontmatter.idea_status = entry.idea_status;
      if (entry.sparked_by) frontmatter.sparked_by = entry.sparked_by;
      break;
    case 'goals':
      if (entry.goal_status) frontmatter.goal_status = entry.goal_status;
      if (entry.target_date) frontmatter.target_date = entry.target_date;
      if (entry.progress_percent !== undefined) frontmatter.progress_percent = entry.progress_percent;
      break;
  }

  const frontmatterLines = Object.entries(frontmatter)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        return `${k}: [${v.map((i) => `"${i}"`).join(', ')}]`;
      }
      if (typeof v === 'string' && v.includes(':')) {
        return `${k}: "${v}"`;
      }
      return `${k}: ${v}`;
    })
    .join('\n');

  return `---\n${frontmatterLines}\n---\n\n${entry.content}`;
}

// Generate file path from entry
function generateFilePath(entry: Entry): string {
  const slug = entry.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const folder = entry.subcategory
    ? `${entry.category}/${entry.subcategory}`
    : entry.category;

  return `${folder}/${slug}.md`;
}

// Sync from GitHub (pull)
export async function pullFromGitHub(): Promise<{
  created: number;
  updated: number;
  errors: string[];
}> {
  const config = await getGitHubConfig();
  if (!config) {
    return { created: 0, updated: 0, errors: ['GitHub not configured'] };
  }

  const result = { created: 0, updated: 0, errors: [] as string[] };

  try {
    // Get all markdown files recursively
    const files = await fetchMarkdownFiles(config, '');

    for (const file of files) {
      try {
        // Fetch file content
        const response = await fetch(
          `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${file.path}`,
          {
            headers: {
              Authorization: `Bearer ${config.token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const content = atob(data.content);
        const { metadata, content: body } = parseFrontmatter(content);

        // Check if entry exists
        const { data: existingEntry } = await supabase
          .from('juliz_portal_entries')
          .select('id, updated_at')
          .eq('github_path', file.path)
          .single();

        const entryData = {
          title: (metadata.title as string) || file.name.replace('.md', ''),
          content: body,
          category: (metadata.category as Category) || inferCategoryFromPath(file.path),
          subcategory: metadata.subcategory as string,
          owner: (metadata.owner as Owner) || 'shared',
          tags: (metadata.tags as string[]) || [],
          github_path: file.path,
          // Category-specific fields
          amount: metadata.amount as number,
          is_recurring: metadata.is_recurring as boolean,
          frequency: metadata.frequency as string,
          due_date: metadata.due_date as string,
          tax_year: metadata.tax_year as number,
          document_type: metadata.document_type as string,
          tax_status: metadata.tax_status as string,
          health_type: metadata.health_type as string,
          appointment_date: metadata.appointment_date as string,
          provider: metadata.provider as string,
          event_date: metadata.event_date as string,
          people_involved: metadata.people_involved as string[],
          location: metadata.location as string,
          idea_status: metadata.idea_status as string,
          sparked_by: metadata.sparked_by as string,
          goal_status: metadata.goal_status as string,
          target_date: metadata.target_date as string,
          progress_percent: metadata.progress_percent as number,
        };

        if (existingEntry) {
          await supabase
            .from('juliz_portal_entries')
            .update(entryData)
            .eq('id', existingEntry.id);
          result.updated++;
        } else {
          await supabase
            .from('juliz_portal_entries')
            .insert(entryData);
          result.created++;
        }
      } catch (err) {
        result.errors.push(`Failed to process ${file.path}`);
      }
    }
  } catch (err) {
    result.errors.push('Failed to fetch from GitHub');
  }

  return result;
}

// Push entry to GitHub
export async function pushToGitHub(entry: Entry): Promise<boolean> {
  const config = await getGitHubConfig();
  if (!config) return false;

  try {
    const path = entry.github_path || generateFilePath(entry);
    const content = generateMarkdown(entry);
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    // Check if file exists to get SHA
    let sha: string | undefined;
    try {
      const existingResponse = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${config.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        sha = existingData.sha;
      }
    } catch {
      // File doesn't exist, that's fine
    }

    // Create/update file
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update ${entry.title}`,
          content: base64Content,
          sha,
        }),
      }
    );

    if (response.ok) {
      // Update entry with github_path
      await supabase
        .from('juliz_portal_entries')
        .update({ github_path: path })
        .eq('id', entry.id);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// Helper: Fetch all markdown files recursively
async function fetchMarkdownFiles(
  config: GitHubConfig,
  path: string
): Promise<GitHubFile[]> {
  const files: GitHubFile[] = [];

  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) return files;

    const items: GitHubFile[] = await response.json();

    for (const item of items) {
      if (item.type === 'dir') {
        // Skip .git and other hidden folders
        if (!item.name.startsWith('.')) {
          const subFiles = await fetchMarkdownFiles(config, item.path);
          files.push(...subFiles);
        }
      } else if (item.type === 'file' && item.name.endsWith('.md') && !item.name.startsWith('CLAUDE')) {
        files.push(item);
      }
    }
  } catch {
    // Ignore errors
  }

  return files;
}

// Helper: Infer category from file path
function inferCategoryFromPath(path: string): Category {
  const categories: Category[] = ['finance', 'taxes', 'health', 'social', 'ideas', 'goals'];
  const firstPart = path.split('/')[0];
  return categories.find((c) => firstPart === c) || 'ideas';
}
