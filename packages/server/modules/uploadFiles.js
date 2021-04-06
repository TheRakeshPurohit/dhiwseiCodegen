const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkAndCreateFolder(filePath) {
  let folderName = filePath.split('/');
  folderName.pop();
  folderName = folderName.join("/");
  console.log('folderName: ', folderName);
  if (!fs.existsSync(folderName)) {
    console.log('creating folder: ', folderName);
    fs.mkdirSync(folderName);
  }
}

module.exports.saveFilesToStaticServer = (files) => {

  let packageJSON;

  Object.keys(files).forEach(fileKey => {

    let rootDir = process.cwd();
    let file = files[fileKey];
    file.name = file.name.split('/');
    file.name.shift();
    file.name = file.name.join('/');
    let oldPath = file.path;
    let newPath = path.join(rootDir, 'public', 'project', 'newProject',  file.name);
    let rawData = fs.readFileSync(oldPath);
    
    checkAndCreateFolder(newPath);

    try {
      fs.writeFileSync(newPath, rawData);
      console.log('file written successfully!');
    } catch (error) {
      console.log("File write error: ", error);
    }

    if(file.name.endsWith('package.json')) {
      let data = fs.readFileSync(newPath);
      console.log('found package.json', data);
      if(data) {
        packageJSON = JSON.parse(data);
      }
      else {
      }
    }
  });

  return packageJSON;
};

module.exports.buildProject = (runScript) => {
  let rootDir = process.cwd();
  let projectDir = path.join(rootDir, 'public', 'project', 'newProject');
  console.log('running build script...');
  const pwd = execSync('pwd', {
    cwd: projectDir
  }).toString();
  console.log('pwd: ', pwd);
  const installResult = execSync('yarn', {
    cwd: projectDir
  }).toString();
  console.log("installResult: ", installResult);
  const result = execSync('yarn build', {
    cwd: projectDir
  }).toString();
  console.log('result: ', result);
};