let express = require('express');
let router = express.Router();
const formidable = require('formidable');
const { saveFilesToStaticServer, buildProject } = require("../modules/uploadFiles");

/* POST upload project. */
router.post('/', function(req, res) {
  const formData = formidable({ multiples: true });

  formData.parse(req, (err, fields, files) => {
    if (err) {
      console.log(err);
      throw err;
    }

    let packageJSON;
    
    if(Object.keys(files).length > 0) {
      let data = saveFilesToStaticServer(files);
      if(data) {
        packageJSON = data;
        console.log('package.json', data);
      }
    }

    if(packageJSON && packageJSON.scripts && packageJSON.scripts.build) {
      console.log('run script: ', packageJSON.scripts.build);
      buildProject(packageJSON.scripts.build);
    }

    res.json({ fields, files });
  });
});



module.exports = router;