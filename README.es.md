# spottingbot - motor de analisis del Atrapabot (Pegabot)
Analizando el perfil en Twitter para detectar el comportamiento de un bot de spam

Para obtener instrucciones de instalación en inglés -> [here](README.md)


**_spottingbot es un proyecto experimental y de código abierto que necesita que evoluciones, no dudes en contribuir en nuestro [GitHub repository](https://github.com/AppCivico/spottingbot) abriendo una solicitud de pull request (PR) o contactando con nosotros en [valentin@appcivico.com](mailto:valentin@appcivico.com). También está disponible una documentación sobre cómo se calculan los índices actuales [here](https://github.com/AppCivico/spottingbot/blob/master/documentation/)_**

**También puedes unirte a nosotros en nuestro [Telegram group](https://t.me/joinchat/AOHjCkUyx1zPuNzhf36mEw) También puedes unirte a nosotros para hablar libremente sobre sugerencias, mejoras o simplemente preguntarnos cualquier cosa**

## Uso

Spottingbot se puede utilizar tanto como una[command-line interface application (cli)](https://github.com/AppCivico/spottingbot#command-line-interface) o como [independent module](https://github.com/AppCivico/spottingbot#module)

### Command-line interface

#### Instalación

`npm install`

#### Archivo de configuración

Cree un archivo `.twitter.json` que contenga:

```json
{
  "consumer_key": "La clave de consumidor de su aplicación",
  "consumer_secret": "El secreto del consumidor de su aplicación",
  "access_token_key": "Clave de token de acceso a su aplicación, solo para autenticación de usuario",
  "access_token_secret": "El secreto de token de acceso de su aplicación, solo para autenticación de usuario"
}
```

*Tanto la autenticación de usuario como la de aplicación solo son compatibles, para solo la aplicación, el Bearer token de portador se solicitará automáticamente*

#### Uso

`npm start username`

*or*

`source/cli.js username`

*`username` tiene que ser reemplazado por el perfil para analizar*

#### Instale bin localmente en su sistema

`npm link` *sudo podría ser necesario*

*Luego*

`spottingbot username`

### Módulo

#### Testeo (Call)

```js
const spottingbot = require('spottingbot');

spottingbot(username, twitter_config, index);
```

`username` es una cadena que contiene el nombre de usuario del perfil de Twitter para analizar.

`twitter_config` es un objeto que contiene credenciales de Twitter, tanto la autenticación de usuario como la de aplicación solo son compatibles, para solo la aplicación, el token de portador se solicitará automáticamente, el objeto `twitter_config` debería ser como:

```js
{
  "consumer_key": "La clave de consumidor de su aplicación",
  "consumer_secret": "El secreto del consumidor de su aplicación",
  "access_token_key": "Clave de token de acceso a su aplicación, solo para autenticación de usuario",  // Only for User authentication
  "access_token_secret": "El secreto de token de acceso de su aplicación, solo para autenticación de usuario"  // Only for User authentication
}
```

`index` se usa para deshabilitar algún índice, es un objeto que se parece a
```js
{
  user: true,
  friend: true,
  temporal: true,
  network: true
}
```

Por defecto, y si se omite, todo es `true` (verdadero).

Para deshabilitar solo un índice, esto no es necesario para poner todo en el objeto, `{friend: false}`, es correcto.

#### Devolver un valor

*spottingbot* maneja ambos *callback* y *node promise* stiles.

##### Callback

```js
spottingbot(username, twitter_config, index, function(error, result) {
  if (error) {
    // manejar errores
    return;
  }
  // Haz algo con el resultado
})
```

##### Promise

```js
spottingbot(username, twitter_config, index)
  .then(result => {
  // Haz algo con el resultado
  })
  .catch(error => {
    // manejar errores
  })
```

##### Value

El valor de retorno es un objeto que contiene

```js
{
  metadata: {
    count: 1 // Siempre 1 por ahora
  },
  profiles: [
     {
       username: 'screen_name',
       url: 'https://twitter.com/screen_name',
       avatar: 'image link',
       language_dependent: {
         sentiment: {
           value: 0.65
         }
       },
       language_independent: {
         friend: 0.19,
         temporal: 0.37,
         network: 0.95,
         user: 0
       },
       bot_probability: {
         all: 0.37
       },
       user_profile_language: 'en',
     }
  ]
}
```

**Spottingbot es un proyecto inspirado en [Botometer](https://botometer.iuni.iu.edu/#!/), an [OSoMe](https://osome.iuni.iu.edu/) proyeto.**

**Este proyecto es parte del [PegaBot](http://www.pegabot.com.br) iniciativa.**

**PegaBot is a project of the [Institute for Technology and Society (ITS Rio)](https://itsrio.org), [Instituto Equidade & Tecnologia](https://tecnologiaequidade.org.br/) and [AppCívico](https://appcivico.com/).**

**Atrapabot (pegabot) es un proyecto experimental y de código abierto que necesita que evoluciones, no dudes en contribuir en nuestro [GitHub repository](https://github.com/AppCivico/spottingbot) abriendo una solicitud de extracción o contactando con nosotros en [valentin@appcivico.com](mailto:valentin@appcivico.com). También está disponible una documentación sobre cómo se calculan los índices actuales [aquí](https://github.com/AppCivico/spottingbot/blob/master/documentation/)**
