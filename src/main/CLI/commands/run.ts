import path from 'path';
import addOrUpdateMyLocalConfig from '../../dataSource/config/addOrUpdateMyLocalConfig';
import processConfig from '../../v1/processConfig';
import execConfig from './service/execConfig';

const isAbsolutePath = (directory: string) => {
  return __dirname.split('/')[0] === directory.split('/')[0];
};
const addAbsolutePathForRunningDirectory = (directory: string) => {
  console.log('directory', directory, process.env.PWD);
  return isAbsolutePath(directory)
    ? directory
    : `${process.env.PWD}/${directory}`;
};
const isGithubOrHttps = (firstPart: string) => {
  return ['github', 'http', 'https'].includes(firstPart);
};

const run = async (args: any[], db: any) => {
  const urlOrPath = args[5];
  let runConfig = 'url';
  const splited = urlOrPath.split('/');

  if (!isGithubOrHttps(splited[0]) || ['', '.'].includes(splited[0])) {
    runConfig = 'path';
  }

  if (runConfig === 'path') {
    let directory = path.dirname(urlOrPath);

    if (urlOrPath.slice(0, 2) === './') {
      directory = path.dirname(urlOrPath.slice(2, urlOrPath.length));
    }
    const parsedConfig = await processConfig(
      `/${path.basename(urlOrPath)}`,
      addAbsolutePathForRunningDirectory(directory)
    );
    console.log(parsedConfig);
    // addMyLocalConfig(parsedConfig, db);
    addOrUpdateMyLocalConfig(parsedConfig, db);
    execConfig(parsedConfig.name, db);
  }
};

export default async (args: any[], db: any) => {
  return Promise.resolve(await run(args, db));
};
