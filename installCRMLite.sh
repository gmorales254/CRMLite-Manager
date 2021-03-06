#Directorio de instalacion
cd /tmp/
#Descarga del repo de CRMLiteManager
REPO="gmorales254/CRMLite-Manager"
GITHUB="https://api.github.com"
CRMLITEVERSION=`curl -sL  -H "Accept: application/vnd.github.v3.raw" https://api.github.com/repos/$REPO/releases/latest | grep "tag_name" | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " "`
asset_id=`curl -s $GITHUB/repos/$REPO/releases  -H "Accept: application/vnd.github.v3.raw" | jq ".[0].assets | map(select(.name == \"CRMLite-Manager$CRMLITEVERSION.zip\"))[0].id"`
curl -fkSL# -o CRMLite-Manager$CRMLITEVERSION.zip -H "Accept:application/octet-stream" $GITHUB/repos/$REPO/releases/assets/$asset_id
echo "Archivo descargado: CRMLite-Manager$CRMLITEVERSION.zip"
unzip CRMLite-Manager$CRMLITEVERSION.zip
printf '########################\n ## Archivo descomprimido, carpeta: /tmp/CRMLite-Manager ##\n'         

#Descarga del repo de CRMLite
REPO="gmorales254/CRMLite"
GITHUB="https://api.github.com"
CRMLITEVERSION=`curl -sL  -H "Accept: application/vnd.github.v3.raw" https://api.github.com/repos/$REPO/releases/latest | grep "tag_name" | cut -d : -f 2,3 | tr -d \" | tr -d , | tr -d " "`
asset_id=`curl -s $GITHUB/repos/$REPO/releases  -H "Accept: application/vnd.github.v3.raw" | jq ".[0].assets | map(select(.name == \"CRMLite$CRMLITEVERSION.zip\"))[0].id"`
curl -fkSL# -o CRMLite$CRMLITEVERSION.zip -H "Accept:application/octet-stream" $GITHUB/repos/$REPO/releases/assets/$asset_id
echo "Archivo descargado: CRMLite$CRMLITEVERSION.zip"
unzip CRMLite$CRMLITEVERSION.zip
printf '########################\n ## Archivo descomprimido, carpeta: /tmp/CRMLiteBUILD ##\n'
# Mover todo a los lugares correspondientes
cp -r /tmp/CRMLite-Manager/CRMLiteManager /etc/IntegraServer/web/forms
cp -r /tmp/CRMLiteBUILD/CRMLite /etc/IntegraServer/web/forms
cp -r /tmp/CRMLite-Manager/CRMLite-reports-manager /etc/IntegraServer/scripts
mysql -u ccuser -p"ccdatapassword2008" < '/tmp/CRMLite-Manager/DB/install.sql'
# Reportes
cp -r /tmp/CRMLite-Manager/REPORTS/* /etc/IntegraServer/reports
mysql -u ccuser -p"ccdatapassword2008" < '/tmp/CRMLite-Manager/REPORTS/install.sql'