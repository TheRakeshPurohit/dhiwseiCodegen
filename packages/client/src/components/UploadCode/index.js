import React from 'react';
import './UploadCode.css';
import { PARSE_FILES } from '../../constants/apiConstants';
import axios from 'axios';

const UploadCode = (props) => {

  const readJsonFile = (file) => {
    console.log('calling readJSON');
    return new Promise((resolve, reject) => {

      console.log('inside promise');
      // File reader to read the contents of the file
      const reader = new FileReader();
      reader.onload = e => {
        let packageJSON = JSON.parse(e.target.result);
        if(packageJSON) {
          console.log('got it: ', packageJSON);
          resolve(packageJSON);
        } else{
          console.log('cannot parse files');
          reject(false);
        } 
      }
      // reject on error
      reader.onerror = e => {
        console.log('reader error', e);
        reject(e)
      }
      reader.readAsText(file);
    });
  };

  const onChange = (e) => {
    const files = [...e.target.files];
    let packageJSON;
    const formData = new FormData();

    files.forEach(async (file, index) => {
      formData.append(`file${index}`, file);
      if(file.webkitRelativePath.endsWith('package.json')) {
        packageJSON = await readJsonFile(file);
      }
    });

    /**
     * Reader Error needs to be fixed
     * see the logs on console
     */
    // if(packageJSON && packageJSON.scripts && packageJSON.scripts.build) {
    if(true) {
      // make axios request;
      axios.post(PARSE_FILES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(function (response) {
        console.log("uploadFilesResponse: ", response);
      })
      .catch(function (error) {
        console.error(error);
      });
    }
    else {
      console.error("Build not found in package.json", packageJSON);
    }
  }

  return (
    <div className="upload-code-container">
      <input name='files[]' type='file' onChange={onChange} directory='' webkitdirectory='' />
    </div>
  )
}

export default UploadCode;
