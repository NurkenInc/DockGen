/**
 * Todo: figure out a way to determine the framework based on all files in repoistory
 * Reasoning: nextjs app package.json may contain nestjs, react or other dependencies and falsely assume that it's nestjs app
 * This is a temporary solution
 */

export const determineFramework = (dependencies: Record<string, string>): string => {
  if (dependencies['next']) {
    return 'next';
  } else if (dependencies['nuxt']) {
    return 'nuxt';
  } else if (dependencies['nest'] || dependencies['@nestjs/core']) {
    return 'nest';
  } else if (dependencies['react']) {
    return 'react';
  } else if (dependencies['vue']) {
    return 'vue';
  } else if (dependencies['@angular/core']) {
    return 'angular';
  }
  return '';
};