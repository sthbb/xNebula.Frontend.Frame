import jsonFormat from 'json-format';
import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs';
import { getDirectoryAndFilesInfo, ajax } from './utils';
import config from './config';

const __dirname = process.cwd();
// console.log(__dirname);
// 从目标目录的文件中取出所有疑似使用了国际化写法的key
function checkFileAndGetKeys(files, targetDirectory) {
  let i18nKeysObject = {}; // 用于收集国际化key的对象
  const i18nKeyRegs = config.i18nKeyRegs;

  files.forEach((relativePath) => {
    const absolutePath = path.resolve(targetDirectory, relativePath);
    // 根据匹配模式扫描文件内容
    i18nKeyRegs.forEach((item) => {
      const { suffix, reg, searchvalue } = item;
      // 处理对应类型的文件
      if (absolutePath.endsWith(suffix)) {
        // 读文件内容
        const data = fs.readFileSync(absolutePath, 'utf-8');
        // 进行正则匹配
        const results = data.match(reg);
        // 处理正则结果
        if (results) {
          results.forEach((result) => {
            // 取出匹配到的i18n的key
            const key = result.replace(reg, searchvalue);
            if (key) {
              i18nKeysObject[key] = key;
            }
          });
        }
      }
    });
  });
  return i18nKeysObject;
}

// 获取http请求的i18n信息，并且根据i18nKeysObject进行组装
function getHttpI18nInfo({
  paramValues,
  paramKey,
  api,
  method,
  outDir,
  srcDir,
}) {
  // 要处理的目标目录
  const targetDirectory = path.resolve(__dirname, srcDir);
  // 获取这个目录中所有的文件与目录信息
  const info = getDirectoryAndFilesInfo(targetDirectory);
  // 单独取出所有的文件信息
  const files = info.files.items;
  // console.log(info);
  const i18nKeys = checkFileAndGetKeys(files, targetDirectory);
  const promises = [];
  const saveInfo = config.saveInfo; // 文件保存信息
  paramValues.forEach((languageType) => {
    const urlOpts = new URL(`${api}?${paramKey}=${languageType}`);
    promises.push(
      ajax({
        hostname: urlOpts.hostname,
        port: urlOpts.port,
        path: urlOpts.pathname + urlOpts.search,
        method,
      }),
    );
  });

  return Promise.all(promises)
    .then((datas) => {
      console.log(`一共${Object.keys(i18nKeys).length}个国际化标识`);
      paramValues.forEach((languageType, index) => {
        // 对不同语言进行处理
        const tempI18nKeys = JSON.parse(JSON.stringify(i18nKeys), null, 2);
        const data = datas[index];
        // 从api返回的国际化数据中将本地对应国际化key的value补值
        Object.keys(tempI18nKeys).forEach((key) => {
          if (data[key]) {
            tempI18nKeys[key] = data[key];
          }
        });

        // 保存文件名
        const fileName = `${saveInfo.fileName}.${languageType}${saveInfo.suffix}`;
        // 目录
        const folderPath = path.resolve(__dirname, outDir);
        // 对应语言文件保存地址
        const filePath = path.resolve(__dirname, outDir, fileName);

        if (!fs.existsSync(folderPath)) {
          // console.log(`目录 ${folderPath} 不存在,创建目录`);
          fs.mkdirSync(folderPath, { recursive: true });
        }

        // 保存当前i18n检查记录
        fs.writeFile(filePath, jsonFormat(tempI18nKeys), (err) => {
          if (err) {
            console.log(`【${languageType}】文件保存失败`);
          } else {
            console.log(`【${languageType}】文件保存成功,路径为: ${filePath}`);
          }
        });
      });
    })
    .catch((e) => {
      console.log('获取语言数据失败', e);
    });
}

export { getHttpI18nInfo };
