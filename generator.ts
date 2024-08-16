import * as fs from 'fs';
import * as path from 'path';

import axios from 'axios';

import { fetchRepositoryContent } from './providers/github';
import { GitHubContentBase } from './shared/github.type';
import { determineFramework } from './utils/determinition.helper';

const generateDockerfileContent = (framework: string): string => {
  const baseNodeDockerfile = `
    FROM node:lts-alpine
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 3000
    CMD ["npm", "run", "start"]
  `.trim();

  const basePythonDockerfile = `
    FROM python:3.9-slim
    WORKDIR /usr/src/app
    COPY requirements.txt ./
    RUN pip install --no-cache-dir -r requirements.txt
    COPY . .
    EXPOSE 8000
    CMD ["python", "app.py"]
  `.trim();

  const baseRubyDockerfile = `
    FROM ruby:2.7
    WORKDIR /usr/src/app
    COPY Gemfile* ./
    RUN bundle install
    COPY . .
    EXPOSE 3000
    CMD ["ruby", "app.rb"]
  `.trim();

  switch (framework) {
    case 'next':
    case 'nuxt':
    case 'nest':
    case 'react':
    case 'vue':
    case 'angular':
      return baseNodeDockerfile;
    case 'python':
      return basePythonDockerfile;
    case 'ruby':
      return baseRubyDockerfile;
    default:
      return '';
  }
};

const analyzeFiles = async (files: GitHubContentBase[]): Promise<string> => {
  let dockerfileContent = '';

  for (const file of files) {
    if (file.type === 'file' && file.name === 'package.json') {
      const packageJsonUrl = file.download_url;

      if (!packageJsonUrl) continue;

      try {
        const response = await axios.get(packageJsonUrl);
        const dependencies = response.data.dependencies || {};
        const framework = determineFramework(dependencies);

        dockerfileContent = generateDockerfileContent(framework);
      } catch (error) {
        console.error('Error fetching package.json:', error);
      }
    } else if (file.type === 'file' && file.name === 'requirements.txt') {
      dockerfileContent = generateDockerfileContent('python');
    } else if (file.type === 'file' && file.name === 'Gemfile') {
      dockerfileContent = generateDockerfileContent('ruby');
    }
  }

  return dockerfileContent;
};

export const generateDockerfile = async (owner: string, repo: string, srcPath: string = '/', token?: string) => {
  const result = await fetchRepositoryContent(owner, repo, srcPath, token);

  if ('message' in result) {
    console.error(result.message);
    return result;
  }

  const files = result;

  if (files) {
    const dockerfileContent = await analyzeFiles(files);
    if (dockerfileContent) {
      fs.writeFileSync(path.join(process.cwd(), 'Dockerfile'), dockerfileContent);
      console.log('Dockerfile generated successfully.');
    } else {
      console.log('No suitable files found to generate Dockerfile.');
    }
  }
};
