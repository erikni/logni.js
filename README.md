# logni.js
logni is a javascript library for event logging and application states

__How to install?__
```
$ npm i logni.js
```
  
__Example:__

_Load script_
```
<script src="node_modules/logni.js/src/logni.js" type="text/javascript"></script>
```

_Initialization_
```
<script type="text/javascript">
  logni.debugMode = 0; // Set debug mode
  logni.mask('ALL'); // Set mask
  logni.stderr(1); // Set standard error
  logni.file('https://yourweb/log'); // Set file/url
  
  logni.env('local'); // Set enviroment
  logni.release('0.0.1'); // Set release version
  logni.name('testlog'); // Set application name
</script>
 ```
 
_Log messages_
```
<script type="text/javascript">
  logni.debug('log debug test'); // debug message with priority 1
  logni.info('log info test' ,4); // informational message with priority 4
  logni.warn('log warning test' ,3); // warning message with priority 3
  logni.error('log error test'); // error message with priority 1
  logni.critial('log critical test'); // critical message with priority 1
</script>
```
