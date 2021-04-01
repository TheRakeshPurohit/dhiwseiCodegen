import React, { useState } from 'react';
import "./styles.css";
import "./App.css";
import {
  Sandpack,
  SandpackProvider,
  SandpackPreview
} from "@codesandbox/sandpack-react";
import "@codesandbox/sandpack-react/dist/index.css";
import UploadCode from './components/UploadCode/index';

export default function App() {
  
  const DEV_FILES = {
    "/index.html": `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>`,
    "/index.js": `import React from "react";
    import ReactDOM from "react-dom";
    
    import App from "./App.js";
    
    ReactDOM.render(
        <asdf><App /></asdf>,
        document.getElementById("root")
    );`,
    "/App.js": `import React from "react";
    import "./styles.scss";
    import {Input} from "./comp/Input";
    import lodash from 'lodash';
    import {DatePicker} from 'antd';
    import 'antd/dist/antd.css'; 
    const TitleInput = ({ label }) => {
      return (
        <div>
          <label>{label}</label>
          <select name="title" >
            <option value="">Select {lodash.head([1,2,3])}</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Miss">Miss</option>
          </select>
        </div>
      );
    };
    
    const App = () => {
      return (
        <div className="App">
          <form>
          <DatePicker />
            <Input
              label={"Full Name"}
              placeholder={"Ravi Sojitra"}
            />
    
            <Input
              label={"Email"}
              placeholder={"ravisojitra79@gmail.com"}
            />
    
            <Input
              label={"Website"}
              placeholder={"Your Website"}
            />
    
            <TitleInput
              label={"Title"}
            />
    
            <div className="buttonContainer">
              <button type="reset" >
                Clear
              </button>
              <button type="reset" >
                Reset Default
              </button>
              <button
                type="button"
                className="submitButton"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      );
    };
    export default App;`,
    "/comp/Input.js": `import React from "react";
    const Input = ({
      label,
      placeholder,
      type = "text",
    }) => {
      return (
        <div>
          <label htmlFor={label}>{label}</label>
          <input
            name={label}
            placeholder={placeholder}
            type={type}
          />
        </div>
      );
    };
    export {Input}`,
    "/styles.scss": `body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif;
    }
    
    form {
      max-width: 500px;
      margin: 0 auto;
    }
    
    h1 {
      font-weight: 100;
      color: white;
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 1px solid rgb(79, 98, 148);
    }
    
    .form {
      background: #fff;
      max-width: 400px;
      margin: 0 auto;
    }
    
    p::before {
      display: inline;
      content: "⚠ ";
    }
    
    input {
      display: block;
      box-sizing: border-box;
      width: 100%;
      border-radius: 4px;
      border: 2px solid black;
      padding: 15px 15px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    label {
      line-height: 2;
      text-align: left;
      display: block;
      margin-top: 20px;
      color: black;
      font-weight: bold;
      font-size: 18px;
      font-weight: 200;
    }
    
    button[type="reset"] {
      background: #fff;
      border: 2px solid black !important;
      color: black;
      text-transform: uppercase;
      border: none;
      margin-top: 20px;
      padding: 15px;
      font-size: 16px;
      font-weight: 100;
      letter-spacing: 2px;
      cursor: pointer;
      display: flex;
      align-items: center;
      max-height: 50px;
    }
    select {
      width: 200px;
      padding: 10px;
      border: 2px solid black;
      background-color: white;
      margin-bottom: 10px;
    }
    .buttonContainer {
      justify-content: space-evenly;
      align-items: center;
      display: flex;
      margin-top: 50px;
    }
    .errorText {
      margin: 0px;
      color: red;
    }
    .submitButton {
      background: #000;
      border: 2px solid black !important;
      color: white;
      text-transform: uppercase;
      border: none;
      margin-top: 20px;
      padding: 15px;
      font-size: 16px;
      font-weight: 100;
      letter-spacing: 2px;
      max-height: 50px;
    }
    
    .submitButton:hover {
      cursor: pointer;
    }
    
    input[type="button"]:active,
    input[type="submitButton"]:active {
      transition: 0.3s all;
      transform: translateY(3px);
      border: 1px solid transparent;
      opacity: 0.8;
    }
    
    input:disabled {
      opacity: 0.4;
    }
    
    input[type="button"]:hover {
      transition: 0.3s all;
    }
    
    input[type="button"],
    input[type="submitButton"] {
      -webkit-appearance: none;
    }
    
    .App {
      max-width: 600px;
      margin: 0 auto;
    }`
  };

  const [files, setFiles] = useState(undefined);
  const [entry, setEntry] = useState('/index.js');
  const [dependencies, setDependencies] = useState({
    lodash: "latest",
    antd: "latest"
  });

  console.log("files => ",files)
  
  return (
    <div className="App">
      <UploadCode 
        setFiles={setFiles} 
        setEntry={setEntry}
        setDependencies={setDependencies}
      />
      {
        (files && files !== undefined) &&
        (
          <SandpackProvider
            // template="react"
            customSetup={{
              files: files,
              entry: entry,
              dependencies: dependencies,
             
            }}
          >
            <SandpackPreview viewportSize={{ width: "100%", height: "80vh" }} />
          </SandpackProvider>
        ) 
      }
    </div>
  );
}
