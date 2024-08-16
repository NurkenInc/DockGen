export const determineFramework = (dependencies: Record<string, string>): string => {
  if (dependencies['next']) {
      return 'next';
  } else if (dependencies['nuxt']) {
      return 'nuxt';
  } else if (dependencies['nest']) {
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