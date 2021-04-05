var express = require('express');
var router = express.Router();
let { files, apiFiles } = require('../staticData/files');
const babelParser = require('@babel/parser');
const traverse = require("@babel/traverse").default;
let { isLocalModule, removeEndExtension, getFileExtension } = require('../helpers/astHelpers');
const t = require('@babel/types');
const generate = require('@babel/generator').default;

/**
 * Modules
 */
const { addHooksAndFunctions } = require('../modules/formInputAst');
const { getEntryFile, addViewer, getViewerFiles } = require('../modules/parseFiles');


let filePathsMap = {};

// Ast Runners

/**
 * parse file and add component path
 * as prop to Userdefined components.
 */
const insertFilePaths = (filePath, fileCode) => {
  
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

          // console.log('dependencyNames: ', dependencyNames);

          // remove extension from parent file path
          filePathWithNoExtension = removeEndExtension(filePath);

          // remove parent file name
          filePathWithNoExtension =  filePathWithNoExtension.split('/');
          filePathWithNoExtension.pop();
          filePathWithNoExtension = filePathWithNoExtension.join('/');

          let dependencyPath = `${filePathWithNoExtension}/${node.source.value.split('/').splice(1).join('/')}.js`;
          // console.log('filePathWithNoExtension: ', filePathWithNoExtension);

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
        // console.log('found a dep, injecting prop...');

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

  /**
   * Testing Logs
   */
  // console.log("filePathsMap: ", filePathsMap);
  // console.log('code: ', code);

  return code;
};     

const addApiToForm = (container, inputs, apiUrl) => {

  /**
   * User of providing unique names to 
   * input tags
   */
  let inputCount = 0;

  /**
   * Input name array to hold names
   * of all input tags
   */
  let inputNamesArray = [];

  let fileCode = apiFiles[container.src];
  if(!fileCode) {
    return { msg: 'Container not found' };
  }

  let componentNames = inputs.map(input => input.name);

  let ast = babelParser.parse(fileCode, {
    sourceType: 'module',
    plugins: ['jsx'],
  });

  /**
   * Traverse AST to make changes
   * Order of execution:
   * T1 -> add props to given inputs
   * T2 -> insert `formData` data hook
   * T3 -> insert `onChange` and `onSubmit functions`
   * TODO T2 & T3 only works for VariableDeclaration
   * Need to do same for Exports and Functional Types
   */
  traverse(ast,{
    JSXElement(path) {
      let { node } = path;
      let componentName = "";
      let attributes = {};

      /**
       * Get Component name
       * Looks for patterns like: <Input />
       */
      if(
        node.openingElement &&
        node.openingElement.name &&
        t.isJSXIdentifier(node.openingElement.name) &&
        componentNames.includes(node.openingElement.name.name)
      ) {
        componentName = node.openingElement.name.name;
        console.log("componentName: ", componentName);

        // Check for exitsting name attr
        if(
          node.openingElement &&
          node.openingElement.attributes &&
          node.openingElement.attributes.length > 0
        ) {
          node.openingElement.attributes.forEach(attr => {
            if(attr && attr.name && attr.name.name === "name") {
              attributes.name = attr.value.value;
            }
          });
        }

        // if not set generate unique name.
        if(!attributes.name) {
          attributes.name = `input_${inputCount}`;
          inputCount += 1;

          // Append name attribute to ast
          let nameAttrAst = t.jsxAttribute(t.jsxIdentifier('name'), t.stringLiteral(attributes.name));
          node.openingElement.attributes.push(nameAttrAst);
        }

        // push name to global array
        inputNamesArray.push(attributes.name);

        // Append OnChange ast to attributes
        /**
         * Check if onChange exists
         */
        let hasOnChange = false; 
        node.openingElement.attributes.forEach(attribute => {
          if(t.isJSXAttribute(attribute)) {

            /**
             * If onChange then update value
             */
            if(attribute.name.name === "onChange") {
              let onChangeAst = t.jsxExpressionContainer(t.identifier("onChange"));
              attribute.value = onChangeAst;
              hasOnChange = true;
            }
          }
        });

        /**
         * If no onChange present, create one
         */
        if(!hasOnChange) {
          let onChangeAst = t.jsxAttribute(
            t.jsxIdentifier('onChange'), 
            t.jsxExpressionContainer(t.identifier("onChange"))
          );
          node.openingElement.attributes.push(onChangeAst);
        }

        // append value in attributes
        /**
         * Check if value attribute exists
         */
        let hasValue = false; 
        node.openingElement.attributes.forEach(attribute => {
          if(t.isJSXAttribute(attribute)) {
            /**
             * If `value` present then update value
             */
            if(attribute.name.name === "value") {
              let valueAst = t.jsxExpressionContainer(
                t.memberExpression(
                  t.identifier('formData'), 
                  t.identifier(attributes.name)
                )
              );
              attribute.value = valueAst;
              hasValue = true;
            }
          }
        });

        /**
         * If no `value` attribute present, create one
         */
        if(!hasValue) {
          let valueAst = t.jsxAttribute(
            t.jsxIdentifier('value'), 
            t.jsxExpressionContainer(
              t.memberExpression(
                t.identifier('formData'), 
                t.identifier(attributes.name)
              )
            )
          );
          node.openingElement.attributes.push(valueAst);
        }
        
        /**
         * Testing Logs
         */
        console.log("hasOnChange: ", hasOnChange);
        console.log("hasValue: ", hasValue);

      }
    },
    VariableDeclaration(path) {
      /**
       * Need to check if this is the container node
       */
      
      const { node } = path;

      /**
       * Scan through declarations to find container node
       */
      if(
        node.declarations &&
        node.declarations.length > 0
      ) {

        /**
         * Find index of container node
         */
        let containerNode = node.declarations.find((declaration) => {
          if(
            t.isVariableDeclarator(declaration) &&
            declaration.id && t.isIdentifier(declaration.id) &&
            declaration.id.name === container.name
          ) {
            return true;
          }
          else {
            return false;
          }
        });

        if(containerNode) {

          /**
           * Found It, start editing, and finally
           * replace node with path.replaceWith
           */

          /**
           * Adding Data hooks
           * `formData` - to store form's data
           */
          
          containerNode = addHooksAndFunctions(containerNode, apiUrl );
          

          /**
           * Adding `onChange` and `onSubmit` functions
           */
          // containerNode = addFunctions(containerNode);

          /**
           * Replace current node with updated AST
           */
          path.replaceWith(containerNode);

        }

        /**
         * Testing Logs
         */
        // console.log("containerNode: ", containerNode);
      }
    },

  });

  /**
   * Convert ast back to code
   */
  const { code } = generate(ast, {
    sourceType: 'module',
    plugins: ['jsx'],
  }, fileCode);

  /**
   * Testing Logs
   */
  console.log('inputNamesArray: ', inputNamesArray);
  console.log('code: ', code);

};

// Route Handlers
router.post('/parseFiles', async function(req, res) {

  try {

    let { files } = req.body;
    // console.log('files: ', files);

    const entryFile = getEntryFile(files);

    Object.keys(files).forEach(file => {
      if(getFileExtension(file) === "js") {

        // Check if entry file
        if(file === entryFile) {
          
          // Add ViewerJS to entry file
          files[file] = addViewer(files[file]);
        }

        // Add path prop to the file's code.
        let fileUpdatedCode = insertFilePaths(file, files[file]);

        // update current files code.
        files[file] = fileUpdatedCode;
      }
    });

    const viewerFiles = await getViewerFiles(entryFile);

    files = {
      ...files,
      ...viewerFiles
    };

     /**
     * Testing Logs
     */
    // console.log('viewerFiles: ', viewerFiles);

    return res.json({ files });

  } catch (error) {
    throw error;
  }
});

router.post('/addApiToForm', (req, res) => {

  let { container, inputs, apiUrl } = req.body;
  if(!container || !inputs || !apiUrl) {
    res.statusCode = 400;
    res.json({ msg: 'Missing Fields' })
  }

  try {
    
    const result = addApiToForm(container, inputs, apiUrl);
    res.json({ ...result });
    
  } catch (error) {
    throw error;
  }

});


module.exports = router;
