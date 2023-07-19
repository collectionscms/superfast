import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import express from 'express';
import path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import { env } from '../../env.js';
import { initAdminServer } from '../../express/admin.js';
import { pathList } from '../../utilities/pathList.js';
import { adminConfigure } from '../../webpack/adminConfigure.js';
import { serverConfigure } from '../../webpack/serverConfigure.js';

export const scriptDev = async () => {
  // /////////////////////////////////////
  // Server
  // /////////////////////////////////////
  serverConfigure.entry = pathList.root('scripts', 'entries', 'dev.js');
  serverConfigure.output!.path = pathList.devBuild();
  serverConfigure.plugins = [
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: [
          `ADMIN_PATH="${pathList.admin()}" nodemon -q --watch ${pathList.devBuild()} ${pathList.devBuild(
            'main'
          )} ./index.ts`,
        ],
        parallel: true,
        blocking: false,
      },
    }),
  ];

  const serverCompiler = webpack(serverConfigure);
  serverCompiler.watch(
    {
      aggregateTimeout: 300,
    },
    () => {}
  );

  // /////////////////////////////////////
  // Admin UI
  // /////////////////////////////////////
  const app = express();
  await initAdminServer(app);

  const publicPath = '/admin';
  const hmrPath = `${publicPath}/__webpack_hmr`;

  adminConfigure.entry = [
    pathList.admin('index.js'),
    `webpack-hot-middleware/client?path=${hmrPath}`,
  ];
  adminConfigure.plugins = [
    ...(adminConfigure.plugins || []),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshPlugin(),
  ];

  if (env.WEBPACK_BUNDLE_ANALYZER === 'true') {
    adminConfigure.plugins.push(new BundleAnalyzerPlugin());
  }

  const adminCompiler = webpack(adminConfigure);
  const devMiddleware = WebpackDevMiddleware(adminCompiler, {
    publicPath: adminConfigure.output?.publicPath,
  });

  app.use(devMiddleware);
  app.use(
    WebpackHotMiddleware(adminCompiler as any, {
      path: hmrPath,
    })
  );

  app.get(['/admin/*', '/admin'], (req, res) => {
    const index = devMiddleware!.context!.outputFileSystem!.readFileSync!!(
      path.join(adminConfigure!.output!.path!, 'index.html')
    );
    res.end(index);
  });
};
