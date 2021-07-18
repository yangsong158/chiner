// 桌面版

import fs from 'fs';
import path from 'path';
import moment from 'moment';
import * as _ from 'lodash/object';
import { projectSuffix } from '../../profile';
const { execFile } = require('child_process');

const { ipcRenderer, remote } = require('electron');
const { app, dialog } = remote;

const user_config = 'user_config.json';
const project_config = 'project_config.json';
const base_path = 'userData';
const basePath = app.getPath(base_path);
// 此处分为两个目录 一个为用户的配置信息user_config 一个为通用的项目配置信息project_config
const userConfigPath = basePath + path.sep + user_config;
const projectConfigPath = basePath + path.sep + project_config;
// 执行jar包时输出的json文件路径
const execJarOut = basePath + path.sep;
// 删除整个目录 包括目下的所有文件
const deleteDirectoryFile = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = `${dirPath}${path.sep}${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectoryFile(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
};
// 判断目录是否存在 如果不存在则创建
export const ensureDirectoryExistence = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    const parentDir = path.dirname(dirPath);
    ensureDirectoryExistence(parentDir);
    fs.mkdirSync(dirPath);
  }
};
// 文件名和路径拼接
export const dirSplicing = (dir, fileName) => {
 return path.join(dir, fileName);
};
// 获取文件所在的目录
export const dirname = (file) => {
  return path.dirname(file);
};
// 判断文件是否已经存在
export const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};
// 删除文件
export const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const saveNormalFile = (file, dataBuffer) => {
  // 通用的文件保方法
  return new Promise((res, rej) => {
    fs.writeFile(file, dataBuffer, (err) => {
      if(err){
        rej(err);
      }else{
        res(dataBuffer);
      }
    });
  });
};

export const readNormalFile = (filePath) => {
  // 通用的文件读取方法
  return new Promise((res, rej) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data);
      }
    });
  })
};

export const saveJsonPromise = (filePath, data) => {
  return new Promise((res, rej) => {
    const tempData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const tempFilePath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
    saveNormalFile(tempFilePath, tempData).then((data) => {
      res(data);
    }).catch((err) => {
      rej(err);
    });
  });
};

export const readJsonPromise = (filePath) => {
  return new Promise((res, rej) => {
    const tempFilePath = filePath.endsWith('.json') ? filePath : `${filePath}.json`;
    readNormalFile(tempFilePath).then((data) => {
      res(JSON.parse(data.toString().replace(/^\uFEFF/, '')));
    }).catch((err) => {
      rej(err);
    });
  });
};

export const saveJsonPromiseAs = (data) => {
  const tempData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const extensions = [];
  if (process.platform === 'darwin') {
    // mac 下无法识别.XXX.json为后缀的文件
    extensions.push('json');
  } else {
    extensions.push(`${projectSuffix}.json`);
  }
  return new Promise((res, rej) => {
    saveFile(tempData, [{ name: projectSuffix, extensions: extensions}], (path) => {
      if (!path.endsWith(`.${projectSuffix}.json`)) {
        return path.replace(/\.json$/g, `.${projectSuffix}.json`);
      }
      return path;
    }).then(({filePath}) => res(filePath)).catch(err => rej(err));
  });
};

export const getUserConfig = () => {
  return new Promise((res, rej) => {
    // 获取用户的配置信息
    const defaultUserConfigData = {
      projectHistories: [], // 历史项目记录
      lang: 'zh', // 当前应用使用的语言
    };
    const defaultProjectConfigData = {
      commonFields: [], // 通用字段信息 多个项目可通用
    };
    /*
    * %APPDATA% Windows 中
    * $XDG_CONFIG_HOME or ~/.config Linux 中
    * ~/Library/Application Support macOS 中
    * */
    const getData = (path, defaultData) => {
      return new Promise((r, j) => {
        readJsonPromise(path).then((data) => {
          r(data);
        }).catch(() => {
          // 如果用户信息报错 则需要使用默认数据进行覆盖
          saveJsonPromise(path, defaultData).then(() => {
            r(defaultData);
          }).catch((err) => {
            rej(err);
          })
        });
      })
    };
    Promise.all([getData(userConfigPath, defaultUserConfigData),
      getData(projectConfigPath, defaultProjectConfigData)]).then(result => {
        setTimeout(() => {
          res(result);
        }, 1000);
    }).catch((err) => {
      rej(err);
    });
  });
};

export const saveUserConfig = (data = []) => {
  return new Promise((res, rej) => {
    Promise.all([saveJsonPromise(userConfigPath, data[0] || {}),
      saveJsonPromise(projectConfigPath, data[1] || {})]).then((result) => {
      setTimeout(() => {
        res(result);
      }, 100);
    }).catch((err) => {
      rej(err);
    });
  });
};

export const saveFile = (data, filters, fileValidate, options) => {
  // 将调用系统的目录弹出框
  return new Promise((res, rej) => {
    dialog.showSaveDialog({
      filters: filters || [],
      ...options,
    }).then(({filePath}) => {
      if (filePath) {
        let tempFile = filePath;
        if (fileValidate) {
          // 需要重组文件名
          tempFile = fileValidate(filePath);
        }
        saveNormalFile(tempFile, data).then((data) => {
          res({
            data,
            filePath: tempFile,
          });
        }).catch((err) => {
          rej(err);
        })
      }
    }).catch((err) => {
      rej(err);
    })
  });
};

export const openFile = (filters) => {
  return new Promise((res, rej) => {
    dialog.showOpenDialog({
      filters: filters || []
    }).then(({filePaths}) => {
      if (filePaths.length > 0) {
        readNormalFile(filePaths[0]).then((data) => {
          res(data);
        }).catch((err) => {
          rej(err);
        });
      }
    }).catch((err) => {
      rej(err);
    })
  });
};

export const getJavaHome = () => {
  return process.env.JAVA_HOME || process.env.JER_HOME || '';
};

export const openFileOrDirPath = (filters, properties) => {
  return new Promise((res, rej) => {
    dialog.showOpenDialog({
      filters: filters || [],
      properties: properties || ['openFile'], // 默认是打开文件
    }).then(({filePaths}) => {
      if (filePaths.length > 0) {
        res(filePaths[0])
      }
    }).catch((err) => {
      rej(err);
    })
  });
};

export const openProjectFilePath = (errorFileMessage, suffix) => {
  const tempSuffix = suffix || projectSuffix;
  const extensions = [];
  if (process.platform === 'darwin') {
    // mac 下无法识别XXX.json为后缀的文件
    extensions.push('json');
  } else {
    extensions.push(`${tempSuffix}.json`);
  }
  return new Promise((res, rej) => {
    openFileOrDirPath([{ name: tempSuffix, extensions: extensions}]).then((file) => {
      if (extensions.every(e => !file.endsWith(`.${e}`))) {
        // 项目名不符合规范 抛出异常
        rej(new Error(errorFileMessage || 'Invalid project file'));
      } else {
        res(file);
      }
    }).catch((err) => {
      rej(err);
    })
  });
};

const getProject = (project, type) => {
  const tempArray = project.split(path.sep);
  if (type === 'name') {
    return tempArray[tempArray.length - 1].split('.pdman.json')[0];
  }
  return tempArray.splice(0, tempArray.length - 1).join(path.sep);
};

export const getAllVersionProject = (project, data) => {
  // 获取当前项目的所有版本数据
  const proName = data?.name || getProject(project, 'name');
  const proPath = getProject(project, 'path');
  const proVersionPath = `${proPath}${path.sep}.${proName}.version${path.sep}`;
  return new Promise((res, rej) => {
    fs.readdir(proVersionPath, (err, files) => {
      if (!err) {
        // 读取所有的文件信息 此处需要过滤其他无效的文件(目前先过滤非json文件，以.开头的文件)
        Promise.all(files
          .filter(f => f.endsWith('.json') && !f.startsWith('.'))
          .map(f => readJsonPromise(proVersionPath + f))).
        then((results) => {
          // 返回的项目信息需要以时间顺序进行排序 最近的放在最前面
          const format = 'YYYY/M/D HH:mm:ss';
          res(results
            .sort((a, b) => moment(a?.date, format).millisecond() - moment(b?.date, format).millisecond()))
        }).catch(err => {
          rej(err);
        });
      } else {
        res([]);
      }
    })
  });
};

export const removeAllVersionProject = (project) => {
  // 获取当前项目的所有版本数据
  const proName = getProject(project, 'name');
  const proPath = getProject(project, 'path');
  const proVersionPath = `${proPath}${path.sep}.${proName}.version${path.sep}`;
  deleteDirectoryFile(proVersionPath);
};

export const saveVersionProject = (project, versionData, versionInfo) => {
  const proName = getProject(project, 'name');
  const proPath = getProject(project, 'path');
  const proVersionPath = `${proPath}${path.sep}.${proName}.version${path.sep}`;
  // 判断版本文件目录是否存在
  ensureDirectoryExistence(proVersionPath);
  const filePath = `${proVersionPath}${proName}-${versionInfo.version}.pdman.json`;
  return saveJsonPromise(filePath, {...versionData, ...versionInfo});
};

export const removeVersionProject = (project, versionInfo) => {
  const proName = getProject(project, 'name');
  const proPath = getProject(project, 'path');
  const proVersionPath = `${proPath}${path.sep}.${proName}.version${path.sep}`;
  const filePath = `${proVersionPath}${proName}-${versionInfo.version}.pdman.json`;
  deleteFile(filePath);
};

export const getPathStep = () => {
  return path.sep;
};

export const execFileCmd = (cmd, params, cb) => {
  execFile(cmd, params,
    {
      maxBuffer: 100 * 1024 * 1024, // 100M
    },
    (error, stdout, stderr) => {
      cb && cb(error, stdout, stderr);
    });
};

export const connectDB = (dataSource, params = {}, cmd, cb) => {
  // 创建临时文件
  const outFile = `${execJarOut}${moment().unix()}.json`;
  console.log(outFile);
  const getParam = (params) => {
    const paramArray = [];
    Object.keys(params).forEach((p) => {
      if (p !== 'customer_driver') {
        const param = params[p] || '';
        const value = param.includes(' ') ? `"${param}"` : param;
        paramArray.push(`${p}=${value}`);
      } if (p === 'driver') {
        paramArray.push(`driver_class_name=${params[p]}`);
      }
    });
    return paramArray.concat(`out=${outFile}`);
  };
  const javaHome = _.get(dataSource, 'profile.javaHome', '');
  const jar = ipcRenderer.sendSync('jarPath');
  const tempValue = javaHome ? `${javaHome}${path.sep}bin${path.sep}java` : 'java';
  const customerDriver = _.get(params, 'customer_driver', '');
  const commend = [
    '-Dfile.encoding=utf-8',
    '-Xms1024m',
    '-Xmx1024m',
    '-jar', jar, cmd,
    ...getParam(params),
  ];
  if (customerDriver) {
    commend.unshift(`-Xbootclasspath/a:${customerDriver}`);
  }
  execFile(tempValue, commend,
    {
      maxBuffer: 100 * 1024 * 1024, // 100M
    },
    (error, stdout, stderr) => {
      if (error) {
        cb && cb({
          status : "FAILED",
          body : (stdout || stderr || error.message),
        });
      } else {
        readJsonPromise(outFile).then((d) => {
          cb && cb(d);
        }).catch(err => {
          cb && cb({
            status : "FAILED",
            body : err.message,
          });
        }).finally(() => {
          // 删除该文件
          deleteFile(outFile);
          // 删除临时文件夹
          if (params.imgDir) {
            deleteDirectoryFile(params.imgDir);
          }
        });
      }
      //const result = (stdout || stderr || error.message);
      //cb && cb(error ? result : null);
    });
};

export const copyFile = (defaultPath, filters) => {
  return new Promise((res, rej) => {
    dialog.showSaveDialog({
      filters: filters || []
    }).then(({filePath}) => {
      if (filePath) {
        fs.copyFile(defaultPath, filePath, (err) => {
          if (!err) {
            res(filePath);
          } else {
            rej(err);
          }
        });
      }
    }).catch((err) => {
      rej(err);
    });
  });
};

export const saveTempImages = (images) => {
  // 创建临时目录
  const userConfigPath = basePath + path.sep + 'temp_img';
  ensureDirectoryExistence(userConfigPath);
  return new Promise((res, rej) => {
    Promise.all(images.map(i => {
      const filePath = userConfigPath + path.sep + (i.group ? `${i.group}-${i.fileName}` : i.fileName) + '.png';
      return saveNormalFile(filePath, i.data);
    })).then(() => {
      res(userConfigPath);
    }).catch((err) => {
      rej(err);
    })
  });
};

const getDefaultWordTemplate = () => {
  return ipcRenderer.sendSync('docx');
}

export const saveAsWordTemplate = () => {
  return copyFile(getDefaultWordTemplate(), [{name: 'chiner-docx-tpl', extensions: ['docx']}]);
};

export const selectWordFile = (dataSource) => {
  const template = _.get(dataSource, 'profile.generatorDoc.docTemplate');
  const name = _.get(dataSource, 'name');
  let defaultPath = template || getDefaultWordTemplate();
  return new Promise((res, rej) => {
    openFileOrDirPath([], ['openDirectory']).then((dir) => {
      res([`${dir}${path.sep}${name}-${moment().format('YYYYMDHHmmss')}.docx`, defaultPath]);
    });
  })
};

export const writeLog = (err) => {
  const logPath = `${basePath}${path.sep}${moment().format('YYYY-M-D-HH-mm-ss')}-error-log.txt`;
  return new Promise((res) => {
    saveNormalFile(logPath,err.stack)
        .then(() => res(logPath))
  });
};
