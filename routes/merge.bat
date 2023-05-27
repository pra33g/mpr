set home_dir=%~dp0
set gswin64c_dir=%home_dir%\pdfbm\gs\bin
set uploads_dir=%home_dir%\upload\

cd %uploads_dir%
for %%x in (%*) do (
    copy %%~x %gswin64c_dir%
)
cd %gswin64c_dir%
gswin64c.exe -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=merged.pdf %1 %2 %3 %4 %5 %6 %7 %8 %9
copy merged.pdf %uploads_dir%
del merged.pdf
del %1 %2 %3 %4 %5 %6 %7 %8 %9
