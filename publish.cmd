☺@echo off
rem robocopy c:\dev\badi-web3-live c:\dev\badi-web3-backup /mir 
rem call npm version patch
rem call quasar build
rem robocopy c:\dev\badi-web3\dist c:\dev\badi-web3-live /mir 

call npm version patch
call quasar build
robocopy c:\dev\badi-web3-live c:\dev\badi-web3-backup /mir 
echo.
echo Use Synchronize from c:\dev\badi-web3\dist 
echo                   to c:\dev\badi-web3-live, using compare by content
pause

