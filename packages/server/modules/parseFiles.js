const babelParser = require('@babel/parser');
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const traverse = require("@babel/traverse").default;
const path = require("path");
const fs = require("fs");

module.exports.getEntryFile = (files) => {

  // Search package.json for main file
  let packageFile = Object.keys(files).find(fileName => fileName.endsWith("package.json"));
  if(packageFile && files[packageFile]) {
    let packageObject = JSON.parse(files[packageFile]);
    if(packageObject.main) {
      return packageObject.main;
    }
  }

  /**
   * Default entry file
   * NOTE - This will only work for react-scripts
   * or react-app-rewired
   * TODO - Add Logic for custom configuration
   */
  return "/src/index.js";
};


module.exports.addViewer = (fileCode) => {

  let ast = babelParser.parse(fileCode, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  // Flag to determine if insert is done or not
  let isImported = false;

  /**
   * Traverse file to insert ViewerJS
   * T1 -> Find ReactDOM.render() and replace 
   *  it's 1st argument with ViewerJS attached
   *  <><App /><Viewer /></>
   * T2 -> Import the Viewjs Component
   */
  traverse(ast, {
    ExpressionStatement(path) {
      
      const { node } = path;
      // check if this is ReactDOM.render()
      if(
        node.expression &&
        t.isCallExpression(node.expression) &&
        node.expression.callee &&
        t.isMemberExpression(node.expression.callee) &&
        node.expression.callee.object && node.expression.callee.property &&
        node.expression.callee.object.name === "ReactDOM" &&
        node.expression.callee.property.name === "render"
      ) {
        
        console.log('found it');
        // Get the 1st arg and update it
        let rootElement = node.expression.arguments[0];

        let viewerJSAST = t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier("Viewer"), [], true), 
          null, 
          []
        );

        let updatedRootAST = t.jsxFragment(
          t.jsxOpeningFragment(), 
          t.jsxClosingFragment(), 
          [rootElement, viewerJSAST]
        );
        
        // // Update 1st arg 
        node.expression.arguments.shift();
        node.expression.arguments.unshift(updatedRootAST);
        // node.expression.arguments[0] = updatedRootAST
      }

      // path.replaceWith(node);

    },
    ImportDeclaration(path) {

      if(!isImported) {
        // import ast
        let importAST = t.importDeclaration(
          [
            t.importDefaultSpecifier(t.identifier("Viewer")),
          ], 
          t.stringLiteral("./Viewer.js")
        );

        path.insertBefore(importAST);
        isImported = true;
      }

    }
  });

  const { code } = generate(ast, {
    sourceType: 'module',
    plugins: ['jsx'],
  }, fileCode);

  // console.log('code: ', code);

  return code;

};

/**
 * Return contents of a file
 */
const readFile = (path) => {
  fs.readFile(path, (err, code) => {
    return code;
  });
};

/**
 * Return array of files and folders
 */
const readFolder = (path) => {
  const viewers = {};
  const files = fs.readdirSync(path);
  files.map(file => {
    const relativePath = `${path}/${file}`
    if(fs.lstatSync(relativePath).isDirectory()){
      readFolder(relativePath)
    } else {
      viewers[relativePath] = fs.readFileSync(relativePath,{encoding:'utf-8'});
    }
  });
  return viewers
};
function getFiles(dir, allFiles = {}, parent = '') {
  const outPut = allFiles || {};
  const files = fs.readdirSync(dir);
  // Object.keys(files).forEach(function(key) {
  //   yield put(setCurrentValue(key, currentValues[key]));
  // })
  files.forEach((file) => {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name,outPut,`${parent}/${file}`)
    } else {
      outPut[`${parent}/${file}`]=fs.readFileSync(name,{encoding:'utf-8'});
      // outPut.push({ name: file, path: `${parent}/${file}`, type: 1 });
    }
  });
  return outPut;
}
module.exports.getViewerFiles = async (entryFile) => {
  
  let files = getFiles(`${__dirname}/ViewerJS`);

  let entryParentPath = entryFile.split("/");
  entryParentPath.pop();
  entryParentPath = entryParentPath.join("/");

  Object.keys(files).forEach(filePath => {
    files[`${entryParentPath}${filePath}`] = files[filePath];
    delete files[filePath];
  });

  // console.log("entryFile: ", entryParentPath);
  // console.log("files: ",files)
  return files;
};