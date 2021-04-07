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
  
  const [src, setSrc] = useState(); 

  return (
    <div className="App">
      <UploadCode />
     {
      src &&
      <div style={{ width: '100%', height: "80vh" }}>
        <iframe src="https://google.co.in" width="100%" height="100%"  />
      </div>
     }
    </div>
  );
}
