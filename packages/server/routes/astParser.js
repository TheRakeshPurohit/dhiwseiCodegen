var express = require('express');
var router = express.Router();
// let files = require('../staticData/files');
const babelParser = require('@babel/parser');
const traverse = require("@babel/traverse").default;
let { isLocalModule, removeEndExtension, getFileExtension } = require('../helpers/astHelpers');
const t = require('@babel/types');
const generate = require('@babel/generator').default;

let filePathsMap = {};

const insertFilePaths = (filePath, fileCode) => {
  
  // let ast = babelParser;
  let ast = babelParser.parse(fileCode, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  // traverse ast for import declarations
  traverse(ast, {
    ImportDeclaration(path) {
      let { node } = path;
      if(node.source && node.source.value) {
        // console.log('source value: ', node.source.value, isLocalModule(node.source.value));
        
        // Add all local modules to filePathsMap
        if(isLocalModule(node.source.value)) {
          let dependencyNames = [];

          // Get Dependencies name
          if(
            node.specifiers && 
            node.specifiers.length > 0
          ) {
            // console.log('got specifiers.');
            node.specifiers.forEach(specifier => {
              // Default Import Implementation
              if(
                t.isImportDefaultSpecifier(specifier) &&
                specifier.local && specifier.local.name 
              ) {
                // Push Dep. name to array
                dependencyNames.push(specifier.local.name);
              }
            });
          }

          console.log('dependencyNames: ', dependencyNames);

          // remove extension from parent file path
          filePathWithNoExtension = removeEndExtension(filePath);

          // remove parent file name
          filePathWithNoExtension =  filePathWithNoExtension.split('/');
          filePathWithNoExtension.pop();
          filePathWithNoExtension = filePathWithNoExtension.join('/');

          let dependencyPath = `${filePathWithNoExtension}/${node.source.value.split('/').splice(1).join('/')}.js`;
          console.log('filePathWithNoExtension: ', filePathWithNoExtension);

          dependencyNames.forEach(dependency => {
            // check is already added
            if(!filePathsMap[dependency]) {
              // insert dependency to filePathsMap
              filePathsMap[dependency] = dependencyPath;
            }
          });
        }
      }
    },
    JSXOpeningElement(path) {
      
      const { node } = path;
      if(
        node.name &&
        t.isJSXIdentifier(node.name) &&
        node.name.name &&
        Object.keys(filePathsMap).includes(node.name.name)
      ) {
        console.log('found a dep, injecting prop...');

        // create ast attribute
        let dhiwisePathAttrAst = t.jsxAttribute(
          t.jsxIdentifier('dhiwiseFilePath'), 
          t.stringLiteral(filePathsMap[node.name.name])
        );

        // insert prop to attributes array
        node.attributes.push(dhiwisePathAttrAst);
      }

    }
  });

  const { code } = generate(ast, {
    sourceType: 'module',
    plugins: ['jsx'],
  }, fileCode);

  console.log("filePathsMap: ", filePathsMap);
  console.log('code: ', code);

  return code;
};     

// const entry = '/src/index.js';

router.post('/', function(req, res) {

  try {

    let { files } = req.body;
    console.log('files: ', files);

    Object.keys(files).forEach(file => {
      if(getFileExtension(file) === "js") {

        // Add path prop to the file's code.
        let fileUpdatedCode = insertFilePaths(file, files[file]);

        // update current files code.
        files[file] = fileUpdatedCode;
      }
    });

    return res.json({ files });

  } catch (error) {
    throw error;
  }
});


module.exports = router;
