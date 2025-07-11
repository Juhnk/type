import type { StorybookConfig } from '@storybook/nextjs';
import { join, dirname } from 'path';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    {
      name: getAbsolutePath('@storybook/addon-docs'),
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [],
          },
        },
      },
    },
    getAbsolutePath('@storybook/addon-onboarding'),
    // Note: Additional addons like @storybook/addon-essentials, @storybook/addon-interactions,
    // @storybook/addon-links, @storybook/addon-a11y need to be installed for full functionality
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },
  features: {
    experimentalRSC: true, // Enable React Server Components support
  },
  staticDirs: ['../public'],
  // Add Tailwind CSS configuration
  webpackFinal: async (config) => {
    // Ensure PostCSS processes Tailwind CSS
    config.module?.rules?.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            implementation: require.resolve('postcss'),
          },
        },
      ],
      include: /\.css$/,
    });
    return config;
  },
};

export default config;
