import {FS} from '../services/fs';

export function last(array) {
  return array[array.length - 1];
}

export function getAbsolutePath(
  relativePath,
  cwd,
  ext
) {
  const fs = new FS();
  const relativePathParts = relativePath.split('/');
  const cwdArr = cwd.split('/');
  const relativePathToCwdArr = [];

  // remove unwanted trailing slash -> ./components/
  if (cwd.endsWith('/')) {
    cwdArr.pop();
  }

  for (const relativePathSeg of relativePathParts) {
    if (relativePathSeg === '..') {
      cwdArr.pop();
    } else if (relativePathSeg !== '.') {
      relativePathToCwdArr.push(relativePathSeg);
    }
  }

  let absolutePath = `${cwdArr.join('/')}/${relativePathToCwdArr.join('/')}`;
  if(!ext && isLocalModule(relativePath)){
    // const isDirectory = fs.isDirectory(absolutePath).valueOf();
    // console.log("isDirectory => ",isDirectory,absolutePath)
    const tempPath = `${absolutePath}.js`
    if(fs.exists(tempPath)){
      absolutePath = tempPath
    }
  } 
  return absolutePath;
}

export function getCanocialName(filePath, ext, cwd) {

  const absoluteFilePath = getAbsolutePath(filePath, cwd, ext);
  let absoluteFilePathParts = absoluteFilePath.split('/');

  // ./main.js => ['.', 'main.js'] => ['main.js']
  if (absoluteFilePathParts[0] === '.') {
    absoluteFilePathParts.splice(0, 1);
  }

  // nav-bar -> NAV__BAR
  absoluteFilePathParts = absoluteFilePathParts.map((filePath) =>
    filePath
      .replace(/-/gi, '_HIPEN_')
      .replace(/\./gi, '_DOT_')
      .toUpperCase()
  );

  const canocialName = absoluteFilePathParts.join('_');

  return canocialName;
}

export function isLocalModule(filePath) {
  return filePath.startsWith('/') || filePath.startsWith('./') || filePath.startsWith('../');
}

export function getFileExt(fileName) {
  if (fileName.includes('.')) {
    const fileNameParts = fileName.split('.');
    const fileExt = last(fileNameParts);

    return fileExt;
  } else {
    return undefined;
  }
}

export function getFileName(filePath) {
  const filePathParts = filePath.split('/');

  return last(filePathParts);
}

export function getModuleMetaData(filePath, cwd = '.') {
  const fileName = getFileName(filePath);
  const ext = getFileExt(fileName);
  const isLocalMod = isLocalModule(filePath);
  const canocialName = getCanocialName(filePath,ext, isLocalMod ? cwd : '.');
  const path = isLocalMod ? getAbsolutePath(filePath, cwd, ext) : filePath;

  return {
    canocialName,
    fileName,
    ext,
    isLocalModule: isLocalMod,
    path,
    deps: [],
    usedBy: []
  };
}