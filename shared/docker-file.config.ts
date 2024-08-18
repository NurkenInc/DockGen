interface FrameworkConfig {
  baseImage: string;
  buildStage?: string;
  installCommand: string;
  copyCommand: string;
  defaultBuildCommand: string;
  defaultStartCommand: string;
  defaultPort: string;
}

const nodeBase: FrameworkConfig = {
  baseImage: 'node:20-slim',
  buildStage: `
    FROM node:20 AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN yarn install
    COPY . .
    RUN {{buildCommand}}
  `,
  installCommand: 'yarn install',
  copyCommand: 'COPY --from=builder /app ./',
  defaultBuildCommand: 'yarn build',
  defaultStartCommand: 'node build',
  defaultPort: '3000',
};

export const frameworkConfigs: Record<string, FrameworkConfig> = {
  next: { ...nodeBase },
  nuxt: { ...nodeBase },
  nest: {
    ...nodeBase,
    defaultStartCommand: 'node dist/main',
  },
  react: { ...nodeBase },
  vue: { ...nodeBase },
  angular: {
    ...nodeBase,
    defaultBuildCommand: 'ng build --prod',
    defaultStartCommand: 'http-server dist',
    defaultPort: '4200',
  },
  python: {
    baseImage: 'python:3.9-slim',
    installCommand: 'pip install --no-cache-dir -r requirements.txt',
    copyCommand: 'COPY . .',
    defaultBuildCommand: '',
    defaultStartCommand: 'python app.py',
    defaultPort: '8000',
  },
  ruby: {
    baseImage: 'ruby:2.7',
    installCommand: 'bundle install',
    copyCommand: 'COPY . .',
    defaultBuildCommand: '',
    defaultStartCommand: 'ruby app.rb',
    defaultPort: '3000',
  },
};
