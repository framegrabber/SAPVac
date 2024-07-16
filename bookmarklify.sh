#!/bin/zsh

# Überprüfen, ob ein Dateiname als Parameter übergeben wurde
if [ $# -eq 0 ]; then
    echo "Bitte geben Sie einen Dateinamen als Parameter an."
    exit 1
fi

# Dateiname aus dem Parameter
file=$1

# Überprüfen, ob die Datei existiert
if [ ! -f "$file" ]; then
    echo "Die Datei $file existiert nicht."
    exit 1
fi

# Temporäre Datei für den minimierten Code
temp_file=$(mktemp)

# JavaScript-Code minimieren mit uglifyjs
# Stellen Sie sicher, dass uglifyjs installiert ist (npm install -g uglify-js)
uglifyjs "$file" -o "$temp_file" -c -m

# Den minimierten Code in eine Variable einlesen
minified_code=$(cat "$temp_file")

# Bookmarklet-Format erstellen mit javascript: Präfix
bookmarklet="javascript:(function(){$minified_code})();"

# Bookmarklet in die Zwischenablage kopieren
echo "$bookmarklet" | pbcopy

# Aufräumen
rm "$temp_file"

echo "Bookmarklet wurde in die Zwischenablage kopiert!"