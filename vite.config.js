// https://github.com/vitejs/vite/issues/2185#issuecomment-784637827
// https://stackoverflow.com/questions/69039093/how-to-change-antd-theme-in-vite-config
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginImp from 'vite-plugin-imp';
import { getThemeVariables } from 'antd/dist/theme';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vitePluginImp({
      libList: [
        {
          libName: 'lodash',
          libDirectory: '',
          camel2DashComponentName: true
        },
        {
          libName: 'antd',
          style: (name) => `antd/es/${name}/style`,
        },
      ],
    }),
    react(),
  ],
  resolve: {
    alias: [
      // { find: '@', replacement: path.resolve(__dirname, 'src') },
      // fix less import by: @import ~
      // https://github.com/vitejs/vite/issues/2185#issuecomment-784637827
      { find: /^~/, replacement: '' },
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: { 'primary-color': '#FFCA28' },
        // modifyVars: getThemeVariables({
        //   dark: true,
        //   // compact: true,
        // }),
        javascriptEnabled: true,
      },
    },
  },
});
