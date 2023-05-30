set home_dir=%~dp0
set gswin64c_dir=%home_dir%\pdfbm\gs\bin
set uploads_dir=%home_dir%\upload\

cd %uploads_dir%
gs.lnk -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dFirstPage=%1 -dLastPage=%2 -sOutputFile=%4 %3