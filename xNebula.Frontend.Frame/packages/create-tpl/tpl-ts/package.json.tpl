{
  "name": "{{{name}}}",
  "token": "please set a valid token...",
  "tplVersion": "{{{version}}}",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "xbuild dev",
    "build": "xbuild build",
    "type-check": "vue-tsc --build --force",
    "lint": "eslint ./**/*.{js,jsx,vue} --fix",
    "beautify": "prettier ./**/*.{js,jsx,ts,tsx,vue,css,scss,json,html} --write"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "~20.14.5",
    "@vue/eslint-config-typescript": "~13.0.0",
    "eslint": "~8.57.0",
    "eslint-config-prettier": "~9.1.0",
    "eslint-plugin-prettier": "~5.2.1",
    "eslint-plugin-vue": "~9.27.0",
    "prettier": "~3.3.3",
    "sass": "~1.77.8",
    "typescript": "~5.4.5",
    "vue": "~3.4.32",
    "vue-tsc": "~2.0.29"
  }
}
