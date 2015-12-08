#!/bin/sh

# Run this script from the folder containing the export from animator.
# Organize the files into folders of 24 images each

dirs=($(find . -type d))

for dir in "${dirs[@]}"; do
  for file in $dir/*.png; do
    filename="${file##*/}"
    filen="${filename%.*}"

    character=${filename%-*}
    number=${filename:(-7):3}
    number=`echo $number|sed 's/^0*//'`
    target=$((number/24))

    mkdir -p $dir/$target
    mv $dir/$filename $dir/$target/$filename
  done
done

# Calculate the minimum crop and offset for each image seqeunce
touch info.txt
find . -depth 2 -type d -exec bash -c "cd '{}' && pwd && convert *.png[1152x648] -trim -layers merge -format '{} %wx%h%X%Y\r\n' info: >> ../../info.txt" \;

# Create sprites from crops and offsets
mkdir E1
mkdir E2

while read p; do
  set $p;
  filename=${1//\//_}
  filename=${filename/_/\/}
  filename=${filename/-/\/}

  # Make a filename like ./E2/watch_3

  convert $1'/*.png[1152x648]' -crop $2 +append -set filename:f $filename ./'%[filename:f].png';
done <info.txt

pngquant 64 E1/**.png --ext .png --force
pngquant 64 E2/**.png --ext .png --force
