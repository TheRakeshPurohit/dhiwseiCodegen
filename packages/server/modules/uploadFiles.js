const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const viewJSRelativePath = "/modules/ViewerJS";
const { addViewer  } = require("../modules/parseFiles");

function checkAndCreateFolder(filePath, type = 1) {
  let folderName = filePath;
  if(type == 1) {
    // Remove filename for files
    console.log("found file");
    folderName = filePath.split('/');
    folderName.pop();
    folderName = folderName.join("/");
  }
  console.log('folderName: ', folderName);
  if (!fs.existsSync(folderName)) {
    console.log('creating folder: ', folderName);
    fs.mkdirSync(folderName);
  }
}

module.exports.saveFilesToStaticServer = (files, projectFolderName) => {

  let packageJSON;

  Object.keys(files).forEach(fileKey => {

    let rootDir = process.cwd();
    let file = files[fileKey];
    file.name = file.name.split('/');
    file.name.shift();
    file.name = file.name.join('/');
    let oldPath = file.path;
    let newPath = path.join(rootDir, 'public', 'project', projectFolderName,  file.name);
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

function getFiles(dir, allFiles = [], parent = '') {
  let outPut;
  try {
   outPut = allFiles || [];
  }
  catch(error) {
    console.log("error: ", error);
  }
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      outPut = [
        ...outPut,
        {
          name: file,
          path: `${parent}/${file}`,
          type: 2
        },
        ...getFiles(name, [], `${parent}/${file}`)
      ];
     // outPut.push({
       // name: file, path: `${parent}/${file}`, type: 2, child: getFiles(name, [], `${parent}/${file}`),
     // });
    } else {
      outPut.push({ name: file, path: `${parent}/${file}`, type: 1 });
    }
  });
  return outPut;
}
  
module.exports.injectViewerJs = (projectFolder, mainFilePath) => {
  // Import ViewJS files
  const rootDir = process.cwd();
  const projectPath = path.join(rootDir, "public", "project", projectFolder);
  const viewerJSPath = path.join(rootDir, viewJSRelativePath);
  const mainFile = path.join(projectPath, mainFilePath);
  console.log("viewerJSPath: ",viewerJSPath);
  
  const files = getFiles(viewerJSPath);
  console.log("files: ", files);

  if(files.length > 0) {
    files.forEach(file => {

        // Create Viewjs folders in project loacation
       checkAndCreateFolder(path.join(projectPath, file.path), file.type);  
        // Copy files to project location
       if(file.type === 1) {
        try {
           console.log("rawDataPath: ", path.join(viewerJSPath, file.path));
           let rawData = fs.readFileSync(path.join(viewerJSPath, file.path));
           fs.writeFileSync(path.join(projectPath, file.path), rawData);
           console.log('file written successfully!');
        } catch (error) {
           console.log("File write error: ", error);
        }
      }
    });
  }
  
  // Read main file and import viewjs
  let mainFileCode = fs.readFileSync(mainFile).toString();
  console.log("mainFile: ", mainFileCode);
  const updatedCode = addViewer(mainFileCode);  
  console.log("updatedCode: ", updatedCode);
  
  // Update code in mainFile
  fs.writeFileSync(mainFile, updatedCode);

};

module.exports.buildProject = (projectFolderName) => {
  let rootDir = process.cwd();
  let projectDir = path.join(rootDir, 'public', 'project', projectFolderName);
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
