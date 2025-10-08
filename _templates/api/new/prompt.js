const fs = require('fs');

// ディレクトリ内のファイル一覧を取得
const files = fs
  .readdirSync('packages/api-generator/src/defs')
  .filter((f) => !['README.md', 'common', 'index.ts'].includes(f));

module.exports = [
  {
    message: '分野を選択してください',
    name: 'domain',
    type: 'select',
    choices: files,
  },
  {
    message: '/api 以降のパスを入力してください',
    name: 'path',
    type: 'input',
  },
  {
    message: 'メソッドを選択してください',
    name: 'method',
    type: 'select',
    choices: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  {
    message: 'オペレーション名を入力してください',
    name: 'operationName',
    type: 'input',
  },
  {
    message: '処理概要を入力してください',
    name: 'summary',
    type: 'input',
  },
];
