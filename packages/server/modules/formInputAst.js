const t = require('@babel/types');
const parser = require("@babel/parser");

/**
 * Adds `formData` data hook to function body
 */
const addDataHooksToNodeCore = (astNode) => {

  let hookAst = t.variableDeclaration(
    "const", 
    [
      t.variableDeclarator(
        t.arrayPattern([
          t.identifier('formData'),
          t.identifier('setFormData')
        ]), 
        t.callExpression(
          t.identifier('useState'), 
          []
        )
      )
    ]
  );

  astNode.body.unshift(hookAst);

  return astNode;

};

/**
 * Adds `OnChange` and `onSubmit` functions to AST
 */
const addFunctionsCore = (astNode, apiUrl) => {

  let onChangeAST = parser.parse(`
  const onChange = (e) => {
  	setFormData({
    	...formData,
      [e.target.name]: e.target.value
    });
  };`, {
    sourceType: "module",
    plugins: ["jsx"]
  });

  /**
   * Testing Logs
   */
  // console.log('onChangeAST: ', onChangeAST.program.body[0]);
  
  
  astNode.body.unshift(onChangeAST.program.body[0]);

  let onSubmitAST = parser.parse(`
  const onSubmit = (e) => {
  	e.preventDefault();    
    window.fetch("${apiUrl}", {
    	method: "POST",
      	headers: {
        	'Content-Type': "application/json"
        },
      	body: JSON.stringify({...formData})
    });
  };
  `, {
    sourceType: "module",
    plugins: ["jsx"]
  });

  astNode.body.unshift(onSubmitAST.program.body[0]);


  return astNode;

}

/**
 * Add hooks, 
 * Add Functions,
 * NOTE - Only works for ArrowFunction Declarations
 * TODO - Need to do the same for Other Declarations
 */
module.exports.addHooksAndFunctions = (astNode, apiUrl) => {

  /**
   * Arrow function check
   */
  if(
    astNode.init &&
    t.isArrowFunctionExpression(astNode.init) &&
    astNode.init.body &&
    t.isBlockStatement(astNode.init.body) 
  ) {

    astNode.init.body = addFunctionsCore(astNode.init.body, apiUrl);
    astNode.init.body = addDataHooksToNodeCore(astNode.init.body);
  
  }

  /**
   * Testing Logs
   */
  // console.log("astNode: ", astNode);


  return astNode;

}