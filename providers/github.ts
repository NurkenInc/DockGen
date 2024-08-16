import axios from 'axios';

import { GITHUB_API_URL } from '../shared/common.const';
import { GitHubContentBase } from '../shared/github.type';
import { Problem } from '../shared/problem.type';

/**
 * Fetches the content of a file or directory from a GitHub repository.
 *
 * @param token The access token for the GitHub repository.
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param path The path to the file or directory(User should define root path of the directory).
 * @returns The content of the file or directory.
 */
export const fetchRepositoryContent = async (owner: string, repo: string, path: string = '/', token?: string): Promise<GitHubContentBase[] | Problem> => {
  try {
    const url = `${GITHUB_API_URL}/${owner}/${repo}/contents/${path}`;

    const headers: { [key: string]: string } = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response= await axios.get<GitHubContentBase[]>(url, { headers });

    if (response.status !== 200) {
      console.error('Failed to retrieve content:', response.status, response.statusText);
      return { status: response.status, message: 'Failed to retrieve repository content.' };
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching repository content:', error);
    return { status: 500, message: 'An error occurred while fetching repository content.' };
  }
};
