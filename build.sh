#!/bin/sh

echo "js: start."
echo

echo -n "js: clean ... "
rm -rf build
rm -rf node_modules
echo "done"
echo

echo "js: npm install & update:"
mkdir -p build/js
npm install
npm update
echo

echo -n "js: build es6 logni.min.js ... "
./node_modules/babel-minify/bin/minify.js src/logni.js -o build/js/logni.min.js
echo "done"
echo

echo -n "js: build es5 lognies5.min.js ... "
npx babel src/logni.js --presets babel-preset-env > build/js/lognies5.js
./node_modules/babel-minify/bin/minify.js build/js/lognies5.js -o build/js/lognies5.min.js
echo "done"
echo

echo -n "js: clean ... "
rm -rf node_modules
echo "done"
echo 

echo "js: build check:"
ls -l build/js/*.js
echo

echo "js: .finish"
