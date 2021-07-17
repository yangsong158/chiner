module.exports = {
  port: 3005,
  host: 'localhost',
  protocol: 'http',
  separator: '%', // 为了防止命名字符串冲突，系统所有的字符串分隔符将采用%（在系统中任意命名输入将禁止包含%）
  msgSeparator: '=>',
  projectSuffix: 'chnr',
  prefix: 'chiner', // 默认样式前缀
};
