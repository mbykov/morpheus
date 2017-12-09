# Morpheus for Chinese and other Oriental languages

> An electron-vue project

#### Build Setup

``` bash
# install dependencies
yarn

# serve with hot reload
yarn run dev

```

#### troubles?

in case of errors like this:

. . .
NODE_MODULE_VERSION 57. This version of Node.js requires
NODE_MODULE_VERSION 54. Please try re-compiling or re-installing
. . .

``` bash

# install electron-rebuild
 yarn add electron-rebuild

# fix the bug
 ./node_modules/.bin/electron-rebuild -f -w leveldown

```
