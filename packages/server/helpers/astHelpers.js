module.exports.isLocalModule = (filePath) => {
  return filePath.startsWith('./') || filePath.startsWith('../');
}

// converts /src/App.js --> /src/App
module.exports.removeEndExtension = (filePath) => {
  let pathArr = filePath.split('/');
  let lastItem = pathArr.pop().split('.');
  lastItem.pop();
  return [...pathArr, lastItem].join('/');
};

module.exports.getFileExtension = (filePath) => {
  let pathArr = filePath.split('/');
  let lastItem = pathArr.pop().split('.');
  return lastItem.pop();
}