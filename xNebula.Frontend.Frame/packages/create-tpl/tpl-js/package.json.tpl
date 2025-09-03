{
  "name": "{{{name}}}",
  "token": "please set a valid token...",
  "tplVersion": "{{{version}}}",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "xbuild dev",
    "build": "xbuild build",
    "lint": "eslint ./**/*.{js,jsx,vue} --fix",
    "beautify": "prettier ./**/*.{js,jsx,vue,css,scss,json,html} --write"
  },
  "dependencies": {},
  "devDependencies": {
    "eslint": "~8.57.0",
    "eslint-config-prettier": "~9.1.0",
    "eslint-plugin-prettier": "~5.2.1",
    "eslint-plugin-vue": "~9.27.0",
    "prettier": "~3.3.3",
    "sass": "~1.77.8",
    "vue": "~3.4.32"
  }
}
