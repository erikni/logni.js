[![npm version](http://img.shields.io/npm/v/logni.js.svg?style=flat)](https://npmjs.org/package/logni.js "View this project on npm")
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/0fb77aa3a049446db8d61b854b985abc)](https://www.codacy.com/app/erikni/logni.js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=erikni/logni.js&amp;utm_campaign=Badge_Grade)
[![Github Releases](https://img.shields.io/github/downloads/atom/atom/latest/total.svg)](https://github.com/erikni/logni.js/releases)
[![Build Status](https://secure.travis-ci.org/erikni/logni.js.png?branch=master)](http://travis-ci.org/erikni/logni.js)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENCE)

# logni.js
logni is a javascript library for event logging and application states

__How to install?__
- git (github)
- node package manager


Install from Github
```
$ git clone https://github.com/erikni/logni.js.git
$ cd logni.js
```

Install from Node package manager
```
$ npm i logni.js
```

  
__Example:__

_Load script_
```
<script src="src/logni.js" type="text/javascript"></script>
```

or from CDN:
```
<script src="https://live-jslib.logni.net/js/logni.min.js" type="text/javascript"></script>
```


_Initialization_
```
<script type="text/javascript">
  logni.mask('I3E1C1W2'); // Set mask
  logni.stderr(1); // Set standard error
  logni.file('https://develop-jslog.logni.net'); // Set your file/url for logging
  
  logni.env('local'); // Set enviroment
  logni.release('1.2.3'); // Set release version
  logni.name('testlog'); // Set application name
</script>
 ```

 
_Log messages_
```
<script type="text/javascript">
  logni.debug('log debug test is hidden -> mask for debug not set'); // debug message with priority 1
  logni.info('log info test is visible', 4); // informational message with priority 4
  logni.warn('log warning test is visible', 3); // warning message with priority 3
  logni.error('log error test is visible'); // error message with priority 1
  logni.critical('log critical test is visible'); // critical message with priority 1
  logni.info('log info test is hidden -> low mask', 1); 
</script>
```
