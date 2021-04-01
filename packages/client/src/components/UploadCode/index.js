import React from 'react';
import './UploadCode.css';
import { PARSE_FILES } from '../../constants/apiConstants';
// import { useSandpack } from '@codesandbox/sandpack-react';


// const fs = new FS();

const UploadCode = (props) => {

  // const { dispatch, listen } = useSandpack();

  // Get dependencies out of package.json
  const getDependencies = (file) => {

    // parse json from file
    const fileJSON = JSON.parse(file.value);
    if(fileJSON && fileJSON.dependencies) {

      // if json file has dependencies, update in state hook
      props.setDependencies({...fileJSON.dependencies});
    }

    // console.log('json data: ', fileJSON);
    // console.log('found package.json', file);
  };

  // Read data of uploded file 
  // Return a resolved/rejected promise
  const getFileData = file => {

    // Must return a promise
    return new Promise((resolve, reject) => {
      
      // File reader to read the contents of the file
      const reader = new FileReader();

      // determine what happens on load
      // TODO: need to get package.json, and determine dependencies

      reader.onload = e => {

        // log file contents
        // console.log('./' + file.webkitRelativePath.split('/').splice(1).join('/'), " => ", );

        // if file is package.json, get all dependencies
        if(file.webkitRelativePath.endsWith('package.json')) {
          getDependencies({
            key: '/' + file.webkitRelativePath.split('/').splice(1).join('/'),
            value: e.target?.result
          });
        }

        resolve({
          key: '/' + file.webkitRelativePath.split('/').splice(1).join('/'),
          value: e.target?.result
        })
      }

      // reject on error
      reader.onerror = e => {
        reject(e)
      }

      // Reader config stuff
      // normal readAsText
      // images readAsDataUrl
      if (file.type == "image/png") {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const onChange = (e) => {
    const files = [...e.target.files];

    const dataPromises = [], remaining = [];
    files.map(file => {

      // get data and push to dataPromises if valid
      if (["text/javascript", "text/css", "image/svg+xml", "text/x-scss", "image/png"].includes(file.type)) {
        dataPromises.push(getFileData(file));
      } else if (file.webkitRelativePath.endsWith('.jsx')) {
        dataPromises.push(getFileData(file));
      } else if (file.webkitRelativePath.endsWith('.less')) {
        dataPromises.push(getFileData(file));
      } else if (file.webkitRelativePath.endsWith('package.json')) {
        dataPromises.push(getFileData(file));
      } else {

        // if no match push to remaining
        remaining.push(file.webkitRelativePath.split('.').pop());
      }

      // log png files, Why?
      if (file.webkitRelativePath.endsWith('.png')) {
        console.log(file);
      }
      
    });

    // log the remaning files
    console.log('remaining => ', [...new Set(remaining)]);
    
    // wait to resolve all promises
    // then receive the data array
    Promise.all(dataPromises).then(data => {
      const filesObj = {};

      // convert the data array in files object format
      data.map(d => {
        filesObj[d.key] = d.value;
      })

      // set files in state hook
      props?.setEntry('/src/index.js');

      // Call API to parse files
      window.fetch(PARSE_FILES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: filesObj })
      })
      .then(async res => {
        const data = await res.json();
        if (res.ok) {
          return data;
        } else {
          return Promise.reject(data)
        }
      })
      .then(data => props.setFiles(data?.files))
      .catch(err => console.log('err: ', err));
    
    })
  }

  return (
    <div className="upload-code-container">
      <input name='files[]' type='file' onChange={onChange} directory='' webkitdirectory='' />
    </div>
  )
}

export default UploadCode;
