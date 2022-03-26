TOKEN="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"
REPO="gmorales254/CRMLite-Manager"
GITHUB="https://api.github.com"
CRMLITEVERSION=`curl -sL -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3.raw" https://api.github.com/repos/$REPO/releases/latest | grep "tag_name" | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " "`
asset_id=`curl -s $GITHUB/repos/$REPO/releases -H "Authorization: token $TOKEN" -H "Accept: application/vnd.github.v3.raw" | jq ".[0].assets | map(select(.name == \"CRMLiteManager$CRMLITEVERSION.zip\"))[0].id"`
cd /tmp/
curl -fkSL# -o CRMLiteManager$CRMLITEVERSION.zip -H  "Authorization: token $TOKEN" -H "Accept:application/octet-stream" $GITHUB/repos/$REPO/releases/assets/$asset_id
echo "Archivo descargado: CRMLiteManager$CRMLITEVERSION.zip"
unzip CRMLiteManager$CRMLITEVERSION.zip
printf '########################\n ## Archivo descomprimido, carpeta: CRMLiteManager ##\n'                                                                                                                                                                                                         