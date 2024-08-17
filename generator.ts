import * as fs from 'fs';
import * as path from 'path';

import { GitHubContentBase } from './shared/github.type';
import { determineFramework } from './utils/determinition.helper';
import { frameworkConfigs } from './shared/docker-file.config';

export interface DockerfileOptions {
  buildCommand?: string;
  startCommand?: string;
  port?: string;
}

const generateDockerfileContent = (
  framework: string,
  options: DockerfileOptions = {}
): string => {
  const config = frameworkConfigs[framework];
  
  if (!config) {
    throw new Error(`Unsupported framework: ${framework}`);
  }

  const {
    buildCommand = config.defaultBuildCommand,
    startCommand = config.defaultStartCommand,
    port = config.defaultPort
  } = options;

  let dockerfile = `
# Step 1: Build the application
FROM ${config.baseImage} AS builder
WORKDIR /app
COPY package*.json ./
RUN ${config.installCommand}
COPY . .
RUN ${buildCommand}

# Step 2: Run the application
FROM ${config.baseImage}
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV production
ENV PORT ${port}
EXPOSE ${port}
CMD ${startCommand}
  `.trim();

  return dockerfile;
}

const analyzeFiles = (files: GitHubContentBase[], buildCommand?: string, startCommand?: string, port?: string): string => {
  let dockerfileContent = '';

  for (const file of files) {
    if (file.type !== 'file') continue;

    if (file.name === 'package.json') {
      const packageJsonPath = file.path;

      if (!fs.existsSync(packageJsonPath)) continue;

      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = packageJson.dependencies || {};
        const framework = determineFramework(dependencies);

        dockerfileContent = generateDockerfileContent(framework, {
          buildCommand,
          startCommand,
          port,
        });
      } catch (error) {
        console.error('Error reading package.json:', error);
      }
    } else if (file.name === 'requirements.txt') {
      dockerfileContent = generateDockerfileContent('python');
    } else if (file.name === 'Gemfile') {
      dockerfileContent = generateDockerfileContent('ruby');
    }
  }

  return dockerfileContent;
};

export const generateDockerfile = async (srcPath: string = '/', buildCommand?: string, startCommand?: string, port?: string) => {
  const pathToDir = path.join(process.cwd(), srcPath);
  
  const files = fs.readdirSync(pathToDir).map(file => {
    const filePath = path.join(pathToDir, file);
    const stats = fs.statSync(filePath);
    return {
      name: file,
      type: stats.isDirectory() ? 'dir' : 'file',
      path: filePath,
    } as GitHubContentBase;
  });

  const dockerfileContent = analyzeFiles(files, buildCommand, startCommand, port);
  if (dockerfileContent) {
    fs.writeFileSync(path.join(pathToDir, 'Dockerfile'), dockerfileContent);
    console.log('Dockerfile generated successfully.');
  } else {
    console.log('No suitable files found to generate Dockerfile.');
  }
};