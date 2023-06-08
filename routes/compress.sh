# behavior of gs compress script:
# size max for output file at $2 = 250 
# 270 8828609 8835692
# 50 2931106  2930298
#!/bin/bash
cd upload
gs  -q -dNOPAUSE -dBATCH -dSAFER \
    -sDEVICE=pdfwrite \
    -dCompatibilityLevel=1.3 \
    -dPDFSETTINGS=/screen \
    -dEmbedAllFonts=true \
    -dSubsetFonts=true \
    -dColorImageDownsampleType=/Bicubic \
    -dColorImageResolution=$3 \
    -dGrayImageDownsampleType=/Bicubic \
    -dGrayImageResolution=$3 \
    -dMonoImageDownsampleType=/Bicubic \
    -dMonoImageResolution=$3 \
    -sOutputFile=$2 \
     $1
