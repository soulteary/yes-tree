'use strict';

var tree = require('./index');

/**
 * 根据全配置过滤，过滤路径不显示在结果
 */
var projectTree = tree({
        cwd: process.env.PWD,
        depth: 3,
        exclude: {
            path: ['.git', '.idea', 'node_modules'],
            mode: 'all',
            extensions: ['.js']
        },
        json: false
    }
);
console.log(projectTree);

/**
 * 过滤路径显示在结果中，隐藏目录内容
 */
projectTree = tree({
        cwd: process.env.PWD,
        depth: 3,
        exclude: {
            path: ['.git', '.idea', 'node_modules'],
            mode: 'children',
            extensions: ['.js']
        },
        json: false
    }
);
console.log(projectTree);

/**
 * 不过滤扩展
 */
projectTree = tree({
        cwd: process.env.PWD,
        depth: 3,
        exclude: {
            path: ['.git', '.idea', 'node_modules'],
            mode: 'all'
        },
        json: false
    }
);

console.log(projectTree);

/**
 * 不过滤路径
 */
projectTree = tree({
        cwd: process.env.PWD,
        depth: 1,
        exclude: {
            mode: 'all'
        },
        json: false
    }
);

console.log(projectTree);


/**
 * `mode`需要与`path`一起使用
 */
projectTree = tree({
        cwd: process.env.PWD,
        depth: 1,
        exclude: {
            mode: 'children'
        },
        json: false
    }
);

console.log(projectTree);

/**
 * 输出JSON
 */
projectTree = tree({
        cwd: process.env.PWD,
        depth: 1,
        json: true
    }
);

console.log(projectTree);
