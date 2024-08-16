export interface GitHubLink {
  git: string | null;
  html: string | null;
  self: string;
}

export interface GitHubContentBase {
  type: string;
  size: number;
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  _links: GitHubLink;
}

export interface GitHubFileContent extends GitHubContentBase {
  content: string;
  encoding: string;
}

export interface GitHubDirectoryContent extends GitHubContentBase {
  entries: GitHubContentBase[];
}

export type GitHubRepoContent = GitHubFileContent | GitHubDirectoryContent;

export interface GitHubContentResponse {
  title: string;
  description: string;
  type: 'object';
  properties: {
    type: { type: 'string' };
    size: { type: 'integer' };
    name: { type: 'string' };
    path: { type: 'string' };
    sha: { type: 'string' };
    url: { type: 'string'; format: 'uri' };
    git_url: { type: ['string', 'null']; format: 'uri' };
    html_url: { type: ['string', 'null']; format: 'uri' };
    download_url: { type: ['string', 'null']; format: 'uri' };
    entries?: {
      type: 'array';
      items: GitHubContentBase;
    };
    _links: {
      type: 'object';
      properties: {
        git: { type: ['string', 'null']; format: 'uri' };
        html: { type: ['string', 'null']; format: 'uri' };
        self: { type: 'string'; format: 'uri' };
      };
      required: ['git', 'html', 'self'];
    };
  };
  required: [
    '_links',
    'git_url',
    'html_url',
    'download_url',
    'name',
    'path',
    'sha',
    'size',
    'type',
    'url',
    'content',
    'encoding'
  ];
}