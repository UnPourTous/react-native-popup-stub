# React Native Library Seed Project

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## 0. Setup  

``` shell
gulp setup
```
This task will check git&node version and install node modules.

## 1. Run iOS  
We use storybook to show our demo, start storybook and run ios project 

``` shell 
gulp run:storybook run:ios
```

## 2. Run Android  
Almost the same as iOS
``` shell 
gulp run:storybook run:android
```


## 3. Develop

#### 1. First, change code in `./lib`
#### 2. Sync lib to example
``` shell 
gulp dev:syncLib
```
This will delete the origin dir in `./example/node_modules` and reinstall this modules.

## 4. All Tasks
![image](https://user-images.githubusercontent.com/1309744/29419473-c9a6d0a6-83a1-11e7-93cf-0a1b95a0a3ed.png)


## 5. TODO 
- Add githook check for code style
- Try Slush
