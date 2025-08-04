@echo off
REM Windows batch file to copy static files to dist directory
REM Usage: copy_to_dist.bat [target_directory]

set TARGET_DIR=%1
if "%TARGET_DIR%"=="" set TARGET_DIR=dist

echo Copying static files to %TARGET_DIR%...

REM Copy public directory contents
echo Copying public files...
xcopy /E /I /Y public\* %TARGET_DIR%\

REM Copy lib directory WASM files
echo Copying WASM files...
copy /Y src\lib\rlottie\rlottie-wasm.wasm %TARGET_DIR%\
copy /Y src\lib\fasttextweb\fasttext-wasm.wasm %TARGET_DIR%\

REM Copy opus-recorder WASM file
echo Copying opus-recorder files...
copy /Y node_modules\opus-recorder\dist\decoderWorker.min.wasm %TARGET_DIR%\

REM Copy emoji data
echo Copying emoji data...
xcopy /E /I /Y node_modules\emoji-data-ios\img-apple-64 %TARGET_DIR%\img-apple-64\
xcopy /E /I /Y node_modules\emoji-data-ios\img-apple-160 %TARGET_DIR%\img-apple-160\

echo Static files copied successfully! 