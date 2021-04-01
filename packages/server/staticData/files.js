const files = {
  "/public/index.html": `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <meta name="theme-color" content="#000000">
      <!--
          manifest.json provides metadata used when your web app is added to the
          homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
        -->
      <link rel="manifest" href="%PUBLIC_URL%/manifest.json">
      <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      
      <title>React App</title>
    </head>
    
    <body>
      <noscript>
        You need to enable JavaScript to run this app.
      </noscript>
      <div id="root"></div>
      
    </body>
    
    </html>
  `,
  "/src/index.js": `
    import { StrictMode } from "react";
    import ReactDOM from "react-dom";
    
    import App from "./App";
    
    const rootElement = document.getElementById("root");
    ReactDOM.render(
      <StrictMode>
        <App />
      </StrictMode>,
      rootElement
    );
  `,
  "/src/App.js": `
    import "./styles.css";
    import React, { useEffect } from "react";
    import { AddEventListeners } from "./Viewer";
    import UserDataViewer from "./Components/UserDataViewer";
    
    export default function App() {
      useEffect(() => {
        AddEventListeners();
      }, []);
      return (
        <div className="App">
          <h1>Hello CodeSandbox</h1>
          <h2>Start editing to see some magic happen!</h2>
          <UserDataViewer username="talmeez123" email="talmeez@gmail.com" />
        </div>
      );
    }
  
  `,
  "/src/Components/UserDataViewer.js": `
    const UserDataViewer = ({ username, email }) => {
      return (
        <div>
          <h1>{username}</h1>
          <p>{email}</p>
        </div>
      );
    };
    
    export default UserDataViewer;
  `,
  "style.css": `
    .App {
      font-family: sans-serif;
      text-align: center;
    }
  `
};

module.exports =  files;
