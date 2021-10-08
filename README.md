## Paketera electron app
#Installera electron-packager globalt med
`npm install -g electron-packager`

#Därefter kör detta för att paketera electron in i en release-build mapp
`electron-packager . -asar -all --icon="assets/favicon.png" --out=release-build`
