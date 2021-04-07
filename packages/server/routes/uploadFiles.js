let express = require('express');
let router = express.Router();
const formidable = require('formidable');
const path = require('path')
const { saveFilesToStaticServer, buildProject, injectViewerJs } = require("../modules/uploadFiles");
const fs = require("fs");

function makeid(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * 
 charactersLength)));
   }
   return result.join('');
}

router.post("/test", (req, res) => {

 // injectViewerJs("newProject", "/index.js");
  res.json({ msg: "done" });

});

/* POST upload project. */
router.post('/', function(req, res) {
  const formData = formidable({ multiples: true });

  formData.parse(req, (err, fields, files) => {
    console.log('files => ',files)
    if (err) {
      console.log(err);
      throw err;
    }

    let packageJSON;
    
    let projectFolderName = makeid(16);
    console.log("projectFolderName: ", projectFolderName);

    if(Object.keys(files).length > 0) {
      let data = saveFilesToStaticServer(files, projectFolderName);
      if(data) {
        packageJSON = data;
        console.log('package.json', data);
      }
    }

    injectViewerJs(projectFolderName, "/src/index.js");

    if(packageJSON && packageJSON.scripts && packageJSON.scripts.build) {
      let rootDir = process.cwd();
      if(!packageJSON.dependencies.antd) {
         packageJSON.dependencies = {
          ...packageJSON.dependencies,
          "antd": "latest"
        };
      }
      fs.writeFileSync(path.join(rootDir, "public", "project", projectFolderName, "package.json"), JSON.stringify(packageJSON));
      console.log('run script: ', packageJSON.scripts.build);
      buildProject(projectFolderName);
      let filePath = path.join(process.cwd(), 'public', 'project', projectFolderName,'build','index.html');
      res.json({ fields, files,filePath });
    }

  });
});



module.exports = router;
