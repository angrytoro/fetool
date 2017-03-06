import { projectService } from '../../services';
import webpackDevMiddleware from 'webpack-dev-middleware';
import chokidar from 'chokidar';

const QUERY_REG = /\?.+$/;
const VER_REG = /@[\d\w]+(?=\.\w+)/;
let middlewareCache = {};
let watchCache = {};

function watchConfig(projectName, configFilePath, projectCwd) {
  if (!watchCache[projectName]) {
    let watcher = chokidar.watch(configFilePath);
    watcher.on('change', () => {
      projectService.getProject(projectCwd, false);
    });
    watchCache[projectName] = watcher;
  }
}

export default function compiler(req, res, next) {
  let url = req.url, // url == '/projectname/prd/..../xxx@hash值.js|css';
    filePaths = url.split('/'),
    projectName = filePaths[1], // 项目名称
    projectCwd = sysPath.join(process.cwd(), projectName), // 项目的绝对路径
    project = projectService.getProject(projectCwd, true),
    outputDir = project.getConfig('local').output.path || 'prd';

  // 非output.path下的资源不做任何处理
  if (filePaths[2] !== sysPath.relative(projectCwd, outputDir)) {
    next();
    return;
  }

  url = '/' + filePaths.slice(3).join('/').replace(QUERY_REG, '').replace(VER_REG, '');
  req.url = url;
  let requestUrl = url.replace('.map', '').slice(1);
  // let cacheId = sysPath.join(projectName, requestUrl);

  // if (middlewareCache[cacheId]) {
  //   middlewareCache[cacheId](req, res, next);
  //   return;
  // }
  if (middlewareCache[projectName]) {
    middlewareCache[projectName](req, res, next);
    return;
  }

  let compiler = project.getServerCompiler();
  let middleware = webpackDevMiddleware(compiler, {
    lazy: true
  });

  middlewareCache[projectName] = middleware;

  middleware(req, res, next);
  watchConfig(projectName, project.configFile, projectCwd);
};