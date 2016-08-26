'use strict';

const fs = require('fs');
const path = require('path');
const DEFAULT_ERROR = 'error opening dir';

let dirCount = 0, fileCount = 0;
let cfgShowHideFiles = false;

/**
 * 显示统计摘要信息
 */
function showStatics() {
  return console.log(`\n${dirCount} directories, ${fileCount} files`);
}

function showError(src, msg, exitCode) {
  console.error(`${src} [${msg}]`);
  showStatics();
  if (typeof exitCode !== undefined) {
    return process.exit(exitCode);
  }
}

function objectToarray(object) {
  let arr = [];
  for (var prop in object) {
    if (object.hasOwnProperty(prop)) {
      arr.push(object[prop]);
    }
  }
  return arr;
}

function errorHandle(data) {
  let msg = '';
  switch (data.error.errno) {
    case -2:
      msg = DEFAULT_ERROR;
      break;
    default:
      //todo
      console.log(data, 'stats');
      break;
  }
  showError(data.path, msg, data.code);
}

function tree(basePath, relativePath, level, lastArr) {
  if (lastArr === undefined) {
    lastArr = [];
  } else {
    lastArr = [].concat(lastArr.slice(0))
  }
  if (level === undefined) {
    level = 0;
  }
  const fullPath = path.resolve(basePath, relativePath);

  function drawSubItem(item, level, lastArr) {
    let baseAppend = '';
    let lastone = lastArr[lastArr.length - 1];

    for (var i = 0, j = lastArr.length; i < j; i++) {
      if (i === 0) {
        lastArr[i] ? baseAppend = '└' : baseAppend = '|';
      } else {
        baseAppend += '   ';
        if (lastArr[i]) {
          if (lastArr[i + 1] !== undefined) {
            baseAppend += ' ';
          } else {
            baseAppend += '└';
          }
        } else {
          baseAppend += '|';
        }
      }
    }

    // if `true`, is last one
    if (lastone) {
      console.log(baseAppend + '── ' + item);
      if (level === 0) {
        showStatics();
        return true;
        //process.exit(0);
      }
    } else {
      console.log(baseAppend + '── ' + item);
    }
  }

  try {
    let baseStats = fs.statSync(fullPath);

    let msg = '';
    if (!baseStats.isDirectory()) {
      msg = DEFAULT_ERROR;
      showError(relativePath, msg, 2);
    } else {

      let pathList = objectToarray(fs.readdirSync(fullPath, {encoding: 'utf8'}));

      if (pathList.length === 0) {
        if (level === 0) {
          showStatics();
        }
        return true;
        //process.exit(0);
      }

      let step = pathList.length;

      while (step) {
        let curItem = pathList.shift();
        step = pathList.length;

        if (!cfgShowHideFiles) {
          if (curItem[0] === '.' && curItem.length > 1) {
            continue;
          }
        }

        let subFilePath = path.join(basePath, relativePath, curItem);
        let stats = fs.statSync(subFilePath);

        lastArr[level] = pathList.length === 0;

        if (stats.isFile()) {
          fileCount++;
          drawSubItem(curItem, level, lastArr);
        }
        if (stats.isDirectory()) {

          dirCount++;

          drawSubItem(curItem, level, lastArr);
          tree(basePath, path.join(relativePath, curItem), level + 1, lastArr);
        }
      }

    }
  } catch (err) {
    if (err) {
      return errorHandle({error: err, path: relativePath, code: 1});
    }
  }

}

module.exports = tree;
