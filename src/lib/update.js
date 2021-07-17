// eslint-disable-next-line import/named
import { platform } from './middle';

let packageData;
let _http;
let os;

if (platform === 'json') {
  packageData = require('../../package.json');
  _http = require('http');
  os = require('os');
}

const defaultUrl = `http://www.pdman.cn/launch/${os.platform()}/${packageData.version}`;
//const defaultUrl = 'http://127.0.0.1/latest-version.json';

export const compareVersion = (v1 = '') => {
  // 版本规范为 => x.x.x 主版本号.次版本号.小版本号
  const newVersions = v1.split('.');
  const oldVersions = packageData.version.split('.');
  let needUpdate = false;
  for (let i = 0; i < 3; i++) {
    if (newVersions[i] < oldVersions[i]) {
      break;
    } else if(newVersions[i] > oldVersions[i]){
      needUpdate = true;
    }
  }
  return needUpdate;
};

export const getVersion = () => {
  return new Promise((res, rej) => {
    let id;
    const result = _http.get(defaultUrl, (req) => {
      let result = '';
      req.on('data', (data) => {
        result += data;
      });
      req.on('end', () => {
        let json = {};
        try {
          json = JSON.parse(result) || {};
        } catch (e) {
          json = {};
        }
        clearTimeout(id);
        res(json);
      });
      req.on('error', (error) => {
        clearTimeout(id);
        rej(error)
      });
    });
    result.on('error', (error) => {
      clearTimeout(id);
      rej(error);
    });
    id = setTimeout(() => {
      result.abort(); // 超时1.5s
    }, 5000);
  })
};

