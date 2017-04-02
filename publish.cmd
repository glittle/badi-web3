robocopy c:\dev\badi-web3-live c:\dev\badi-web3-backup /mir 
call npm version patch
call quasar build
robocopy c:\dev\badi-web3\dist c:\dev\badi-web3-live /mir 

