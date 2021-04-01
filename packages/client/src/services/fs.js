import { Volume } from 'memfs';

export class FS {

  vol = null;

  constructor(files = {}) {
    this.vol = Volume.fromJSON(files);
  };

  importFromJSON(files) {
    this.vol.fromJSON(files);
  }

  async readFile(filePath) {
    return await this.vol.readFileSync(filePath).toString('utf-8');
  }

};