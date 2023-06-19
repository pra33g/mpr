set home_dir=%~dp0
set gswin64c_dir=%home_dir%\pdfbm\gs\bin
set uploads_dir=%home_dir%\upload\

cd %uploads_dir%
gs.lnk  -q -dNOPAUSE -dBATCH -dSAFER     -sDEVICE=pdfwrite     -dCompatibilityLevel=1.3     -dPDFSETTINGS=/screen     -dEmbedAllFonts=true     -dSubsetFonts=true     -dColorImageDownsampleType=/Bicubic     -dColorImageResolution=%3     -dGrayImageDownsampleType=/Bicubic     -dGrayImageResolution=%3    -dMonoImageDownsampleType=/Bicubic     -dMonoImageResolution=%3     -sOutputFile=%2      %1