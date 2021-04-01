var express = require('express');
var router = express.Router();
var scssCompiler = require('node-sass');
const packageImporter = require('node-sass-package-importer');

/* GET home page. */
router.get('/', function(req, res, next) {

  let scss = `
    @import "test";
    @import '~bootstrap/scss/bootstrap';
    $font-stack:    Helvetica, sans-serif;
    $primary-color: #333;
    
    body {
      font: 100% $font-stack;
      color: $primary-color;
    }
  `;
  try{

    const options = {
      cwd: process.cwd(),
      packageKeys: [
        'sass',
        'scss',
        'style',
        'css',
        'main.sass',
        'main.scss',
        'main.style',
        'main.css',
        'main'
      ],
      packagePrefix: '~'
    };
    let result = scssCompiler.renderSync({
      data: scss,
      importer: packageImporter(options),
      // importer: (url, prev, done) => {
        //   console.log('import url: ', url);
        //   done({
          //     file: "",
          //     contents: ``
          //   })
          // },
          includePaths: [ __dirname ],  
        });
        console.log("result", result);
        res.json({status:200,result:result.css.toString()})
        // console.log('sassResult: ', result.css.toString());
      } catch(err){
        res.json({status:200,err:err.toString()})
        console.log("err => ",err)
      }

  
});



module.exports = router;
