Disponível em [Espanhol](https://github.com/AppCivico/pegabot-backend/tree/master/README_ES.md) [Inglês](https://github.com/AppCivico/pegabot-backend/tree/master/README.md)


# spottingbot
Analisando Perfis no Twitter para detectar comportamento de Bot

**_spottingbot é um projeto experimental e de código aberto que precisa de você para evoluir, não hesite em contribuir no nosso [repositório do GitHub](https://github.com/AppCivico/pegabot-backend) abrindo um pull request ou entrar em contato conosco em [jordan@appcivico.com](mailto:jordan@appcivico.com). Documentação sobre como os índices atuais são calculados está disponível [aqui](hhttps://github.com/AppCivico/pegabot-backend/tree/master/documentation)_**

**Você também pode se juntar a nós no nosso [Grupo de Telegram](https://t.me/joinchat/AOHjCkUyx1zPuNzhf36mEw) para conversar livremente sobre sugestões, melhorias ou simplesmente nos perguntar qualquer coisa.**

## Usagem

spottingbot pode ser usado tanto como interface de linha de comando (cli) ou módulo independente.

### Interface de Linha de Comando

#### Instalação

`npm install`

#### Arquivo de Configuração

Crie um arquivo .env que contenha

```
TWITTER_CONSUMER_KEY="A chave de consumidor da sua aplicação"
TWITTER_CONSUMER_SECRET="O segredo de consumidor da sua aplicação"
TWITTER_ACCESS_TOKEN_KEY="O token de acesso da sua aplicação, só para autenticação de usuário"
TWITTER_ACCESS_TOKEN_SECRET="O secredo de acesso da sua aplicação, só para autenticação de usuário"
```

*Ambas autenticações de Usuário e de Aplicativo são suportadas, para de Aplicação, o token do Portador será requisitado automaticamente*

#### Início

`npm start nome_de_usuário`

*or*

`source/cli.js nome_de_usuário`

*`nome_de_usuário` tem que ser substítuido pelo nome do usuário que deseja-se analisar*

#### Instale o pacote localmente no seu sistema

`npm link` *sudo pode ser necessário*

*Então*

`spottingbot nome_de_usuário`

### Módulo

#### Chamada

```js
const spottingbot = require('spottingbot');

spottingbot(nome_de_usuário, index);
```

`nome_de_usuário` é uma string que contem o screenname do perfil do twitter para analisar.

`twitter_config` É um objeto que contem as credenciais do Twitter, o objecto `twitter_config` deve ser assim:

```js
{
  consumer_key: "A chave de consumidor da sua aplicação",
  consumer_secret: "O segredo de consumidor da sua aplicação",
  access_token_key: "O token de acesso da sua aplicação", // Only for User authentication
  access_token_secret: "O secredo de acesso da sua aplicação" // Only for User authentication
}
```

`index` é usado para desabilitar alguns indices, é um objeto assim:
```js
{
  user: true,
  friend: true,
  temporal: true,
  network: true
}
```

Por padrão, ou omissão, todas as chaves são `true`.

Para desabilitar apensa um Índice, não é necessário adicionar as outras chaves no objeto, `{friend: false}`, vai funcionar.

#### Valor de Retorno

*spottingbot* funciona tanto com *callback* quanto com *promesas do node*

##### Callback

```js
spottingbot(nome_de_usuário, twitter_config, index, function(error, result) {
  if (error) {
    // cuida do erro
    return;
  }
  // faz algo com o resultado
})
```

##### Promesa

```js
spottingbot(nome_de_usuário, twitter_config, index)
  .then(result => {
  // faz algo com o resultado
  })
  .catch(error => {
    // cuida do erro
  })
```

##### Valor

O valor do retorno é um objeto que contem

```js
{
  metadata: {
    count: 1 // Sempre 1 por ora
  },
  profiles: [
     {
       nome_de_usuário: 'screen_name',
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

##### Banco de Dados PSQL

O Pegabot usa um sistema de cache para evitar refazer analises no mesmo usuário.
Esse sistema de cache usa um Banco de Dados PSQL.

Como configurar o Banco de Dados PSQL:
How to set-up the PostgreSQL database:

1. Instale e configura o PSQL na sua máquina
2. Cria um banco de dados para o pegabots. Se quiser, você pode criar um novo usuário com senha para ser o dono da banco de dados, ou só usar o usuário padrão postgres.
3. Preencha os dados do banco no arquivo .env. Examplo:

```
DATABASE_HOST="127.0.0.1"
DATABASE_USER="postgres"
DATABASE_PASSWORD=""
DATABASE_NAME="pegabot"
```

4. Instale o módulo npm `sequelize-cli`
5. Execute as migrations com `sequelize-cli db:migrate`


**spottingbot é um projeto inspirado por [Botometer](https://botometer.iuni.iu.edu/#!/), um porjeto [OSoMe](https://osome.iuni.iu.edu/).**

**Esse projeto é parta de iniciativa [PegaBot](http://www.pegabot.com.br).**

**PegaBot é um projeto do [Instituto de Tecnologia e Sociedade (ITS Rio)](https://itsrio.org), [Instituto Equidade & Tecnologia](https://tecnologiaequidade.org.br/) e [AppCívico](https://appcivico.com/).**

**spottingbot é um projeto experimental e de código aberto que precisa de você para evoluir, não hesite em contribuir no nosso [repositório do GitHub](https://github.com/AppCivico/pegabot-backend) abrindo um pull request ou entrar em contato conosco em [jordan@appcivico.com](mailto:jordan@appcivico.com). Documentação sobre como os índices atuais são calculados está disponível [aqui](hhttps://github.com/AppCivico/pegabot-backend/tree/master/documentation)**