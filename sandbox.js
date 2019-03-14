/*
 * @Author: shixiongfei 
 * @Date: 2019-03-15 00:01:55 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-03-15 01:01:34
 */

const vm = require('vm');

// NodeJS沙盒环境测试代码

try {
  let sandbox = {
    sum: (a, b) => a + b,
    console: console
  };

  let script = new vm.Script(""
    .concat("var globalX = Math.floor(Math.random() * 100);")
    .concat("var globalY = Math.floor(Math.random() * 100);")
    .concat("var globalVar = sum(globalX, globalY);")
    .concat("console.log('I am in the sandbox!!!');")
  );
  let context = vm.createContext(sandbox);

  script.runInContext(context, { timeout: 1000 });

  console.log(`globalX: ${sandbox.globalX}`);
  console.log(`globalY: ${sandbox.globalY}`);
  console.log(`globalVar: ${sandbox.globalVar}`);
} catch(err) {
  console.log(err);
}

// 在一个context里运行代码，里面包含了语言规范规定的内置的一些函数和对象
// 如果我们想要一些语言规范之外的功能或者模块，我们需要把相应对象放到与这个context关联的对象里
// 然而当我们把一些模块功能提供给context的时候，也同时带入了更多的安全隐患

try {
  let sandbox = {};
  let script = new vm.Script(""
    // sandbox的constructor是外层的Object类
    // Object类的constructor是外层的Function类
    .concat("const OutFunction = this.constructor.constructor;")
    // 于是利用外层的Function构造一个函数就可以得到外层的全局this
    .concat("const OutThis = (OutFunction('return this;'))();")
    // 得到require
    .concat("const require = OutThis.process.mainModule.require;")
    // 试试
    .concat("require('fs');")
  );
  let context = vm.createContext(sandbox);
  let result = script.runInContext(context, { timeout: 1000 });

  console.log(result === require('fs'));
} catch(err) {
  console.log(err);
}

// 定制context的时候，任何一个传进去的对象或者函数都可能带来上面的问题
// 生产环境建议使用：https://github.com/patriksimek/vm2
// vm2对这方面做了防护，其它方面也做了更多的安全工作
// 在生产环境实际使用可以考虑在子进程中运行vm2，然后增加更低层的安全限制
// 例如限制进程的权限和使用cgroups进行IO，内存等资源限制
