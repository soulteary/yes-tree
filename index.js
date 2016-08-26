/**
 * yes-tree
 *
 * @author  soulteary
 * @date    2015.06.09
 * @desc    Print directory tree.
 *
 * @options
 *
 *      - @params cwd       {string}            target dir;
 *      - @params json      {boolean}           whether the value is `true`, you'll get json;
 *      - @params depth     {int}               max depth, limit 30, default 30;
 *      - @params exclude   {object}            exclude options;
 *                   - path  {string|array}     exclude path, default [];
 *                   - mode  {string}           whether the value is `all`, hide the item, or hide it's children;
 *                   - extensions  {string}     exclude ext, default [], eg: ['.log','.tmp'];
 *      - @params silent    {boolean}           hide error message, default true;
 *
 * @function directoryTreeObject inspire https://github.com/mihneadb/node-directory-tree
 */

'use strict';
var fs = require('fs');
var path = require('path');

function tree(rootDir, exclude, maxDepth, needJson) {
    // 扫描指定的目录，将结果转换为对象
    var directoryTreeObject = function (name, _depth) {
        try {
            var stats = fs.statSync(name);
        } catch (e) {
            return null;
        }

        var item = {
            fullPath : path.resolve(rootDir, name),
            path     : path.relative(rootDir, name),
            name     : path.basename(name)
        };

        if (!_depth) {
            _depth = 1;
        }
        if (maxDepth - _depth < -1) {
            return null;
        }

        // 是否是需要排除子目录的目录
        var excludeDir = false;
        // 根据路径进行排除
        if (exclude && exclude.path) {
            var curIndex = exclude.path.indexOf(item.fullPath);
            if (curIndex > -1) {
                excludeDir = true;
                if (exclude.mode === 'all') {
                    exclude.path.splice(curIndex, 1);
                    return null;
                }
            }
        }

        if (stats.isFile()) {
            // 根据扩展进行排除
            if (exclude &&
                exclude.extensions &&
                exclude.extensions.length &&
                exclude.extensions.indexOf(path.extname(name).toLowerCase()) > -1) {
                return null;
            } else {
                item.type = 'file';
                item.size = stats.size;
            }
        } else if (stats.isDirectory()) {

            item.type = 'directory';
            item.children = fs.readdirSync(name).map(function (child) {
                return directoryTreeObject(path.join(name, child), _depth + 1);
            }).filter(function (e) {
                return e !== null;
            });
            // 如果不需要列子文件或者无子文件
            if (item.children.length === 0 || excludeDir) {
                return null;
            } else { // The dir has files inside of it, sum up their size
                item.size = item.children.reduce(function (previous, current) {
                    return previous + current.size;
                }, 0);
            }
        } else {
            return null;
        }

        return item;
    };
    // 根据目录JSON输出TREE
    var directoryTree = function (json) {
        if (!json) {
            return '';
        }

        var LINE = {
            siblings : '├── ',
            single   : '└── '
        };

        var result = '';
        result += json.name + '\n';

        function jsonTree(obj, _depth, _isLast) {
            if (!_depth) {
                _depth = 0;
            }
            if (!_isLast) {
                _isLast = [];
            }
            for (var i = 0, j = obj.children.length; i < j; i++) {
                var lastOptions = _isLast.concat([i === obj.children.length - 1]);
                var last = lastOptions[lastOptions.length - 1];
                if (_depth) {
                    // is last one
                    for (var m = 1, n = lastOptions.length; m < n; m++) {
                        result += ((_isLast[m - 1] ? ' ': '|') + ' '.repeat(4));
                    }
                    if (last) {
                        result += LINE.single;
                    } else {
                        result += LINE.siblings;
                    }
                    result += obj.children[i].name + '\n';
                } else {
                    // 处理第一次调用
                    if (last) {
                        result += LINE.single + obj.children[i].name + '\n';
                    } else {
                        result += LINE.siblings + obj.children[i].name + '\n';
                    }
                }
                if (obj.children[i].children) {
                    jsonTree(obj.children[i], _depth + 1, lastOptions);
                }
            }
            return result;
        }

        if (json.children) {
            return jsonTree(json);
        } else {
            return result;
        }
    };

    if (needJson === false) {
        return directoryTree(directoryTreeObject(rootDir));
    } else {
        return directoryTreeObject(rootDir);
    }

}

module.exports = function (options) {

    options.silent = options.silent || true;
    options.json = options.json || false;
    options.exclude = options.exclude || {};
    options.exclude.extensions = options.exclude.extensions || false;

    if (!options.cwd) {
        if (!options.silent) {
            console.log('need params:`cwd`');
        }
        return '';
    }

    var rootPath = options.cwd;
    if (!path.isAbsolute(rootPath)) {
        rootPath = path.resolve('./', rootPath);
    }

    if (!fs.existsSync(rootPath)) {
        if (!options.silent) {
            console.log(rootPath + ' is not exist.');
        }
        return '';
    }

    options.prefix = options.prefix || '';

    if (options.depth) {
        options.depth = parseInt(options.depth, 10);
        if (isNaN(options.depth) || options.depth < 0) {
            options.depth = 0;
        }
    }
    options.depth = Math.min(options.depth, 30);

    var exclude = [], excludeOption = null;
    if (options.exclude && options.exclude.path) {
        switch (Object.prototype.toString.call(options.exclude.path).slice(8, -1)) {
            case 'String':
                exclude = [path.resolve(rootPath, options.exclude.path)];
                break;
            case 'Array':
                for (var i = 0, j = options.exclude.path.length; i < j; i++) {
                    exclude[i] = path.resolve(rootPath, options.exclude.path[i]);
                }
                break;
            default :
                break;
        }
    }
    if (exclude.length) {
        var tmpArr = [];
        for (var m = 0, n = exclude.length; m < n; m++) {
            if (fs.existsSync(exclude[m])) {
                tmpArr[tmpArr.length] = exclude[m];
            }
        }
        exclude = tmpArr;
        excludeOption = options.exclude;
        excludeOption.path = exclude;
    }
    return tree(rootPath, excludeOption, options.depth, options.json);
};
