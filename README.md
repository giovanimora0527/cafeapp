# Alice Frontend
# Aplicacion realizada por Grupo ASD S.A.S
# Author del frontend => Giovanni Mora Jaimes, Nicolas Vivas Bernal

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.1.

## Prerrequisitos
- Tener instalado nodeJS para poder ejecutar comandos npm
- Instalar angular-cli => Instalar angular/cli => npm install --save --g @angular/cli@6.2.1
- Dirigirse a la carpeta donde tiene descargado el proyecto y ejecutar npm install para descargar las dependencias del proyecto


## Servidor de Desarrollo

Ejecutar `ng serve` para un servidor dev. Vaya a `http://localhost:4200/`. La aplicación se volverá a cargar automáticamente si 
cambia alguno de los archivos de origen.


## Build - Construir para entorno de produccion

Ejecutar el comando ng build --prod y el compilado del código aparecera en la carpeta dist/
Comprimir esa carpeta y subir al servidor

## Despliegue en el servidor de produccion con url base diferente
Ejecutar el comando ng build --base-href /alice/ --prod
