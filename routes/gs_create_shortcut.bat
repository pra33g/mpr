set home_dir=%~dp0
set gswin64c_dir=%home_dir%\pdfbm\gs\bin
set uploads_dir=%home_dir%\upload\

cd %uploads_dir%

powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%uploads_dir%\gs.lnk');$s.TargetPath='%gswin64c_dir%\gswin64c.exe';$s.Save()"