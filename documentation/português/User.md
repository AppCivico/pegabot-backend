<!-- **Chave de usuário do perfil:** -->
Este módulo análisa os dados que referem-se ao usuário em si. Ou seja, é abstraído de suas interações e sua rede, e analisado enquanto usuário, apenas.

# Endpoint da API do Twitter utilizado para coleta de dados
* /statuses/user_timeline

# Dados coletados para análise
* Nome
* Nome de usuário (screen name / @)
* Descrição
* Etiqueta de verificação do Twitter
* Imagem de perfil
* Número de seguidores
* Número de amigos
* Data de criação 
* Número de Tweets
* Número de Favoritos
<br />
<br />

# Validação dos dados coletados
* Número de caracteres no nome
* Número de caracteres no nome de usuário, ou seja, o "@"/screen name
* Busca pela subpalavra "Bot" no nome ou no nome de usuário
* Asserção da similaridade entre nome e nome de usuário, após remoção de espaços e underscores
* Número de caracteres na descrição
* Idade da conta em dias.
* Número de tweets postados por dia
<br />
<br />

# Lista de subíndices

- Selo de verificação do Twitter
- Similaridade entre nome e nome de usuário
- Número de dígitos no nome de usuário
- Tamanho do nome
- Tamanho do nome de usuário
- Tamanho da descrição
- Idade
- Tweets por dia
- Favoritos
- Imagem de perfil

# Cálculo de probabilidade:
**Verificar [código fonte](https://github.com/AppCivico/pegabot-backend/blob/master/src/index/user.mjs) deste módulo para comprovar, e visualizar, os cálculos.**

Os resultados dos cálculos listados abaixo são atribuidos a variáveis que serão utilizadas no final do módulo para obter uma pontuação média.

Observações:
* <b>Caso o perfil possua o selo de verificação do Twitter, a análise desse índice é finalizada sem calcular os demais subíndices, com o seu resultado sendo `0` e com `peso 3`, ou seja, menor probabilidade de ser um robô.</b>
* O resultado, ou seja o retorno, varia entre 0 e 1.
* Valor base de cada subíndice: 0,15.

## Fórmula do índice

`Soma de todos os subíndices / 9`

Caso o valor deste cálculo seja maior que `1`, seu valor final deve ser igual a `1`.

## Subíndices
### `Similaridade entre nome e nome de usuário`

Calculado comparando o número de letras em comum entre o nome e o nome de usuário (handle/arroba). Para fazer isso é calculada a [distância de Levenshtein](https://pt.wikipedia.org/wiki/Dist%C3%A2ncia_Levenshtein).

Fórmula: `1 - distância de Levenshtein {nome e handle}` 

Observações:
 - Se o nome ou nome de usuário contêm a subpalavra "bot", o subíndice <b>obrigatoriamente</b> será 1.
 - É removido qualquer espaço do nome do usuário, para fazer a comparação com a handle/arroba.
 - O valor deste subíndice varia entre 0 e 1.
### `Número de dígitos no nome do usuário`

Calculado utilizando a quantidade de dígitos da handle/arroba.

Fórmula: `Número de dígitos do arroba/handle * 0.12`

Observações:
  - <b>Caso o número de dígitos seja menor, ou igual, a `2`. O valor do subíndice sempre será `0.15`</b>
  - Como o valor do subíndice deve ser tratado como porcentagem, caso o resultado da fórmula seja maior que `1`, o valor será sempre `1`.
<br />
<br />

### `Tamanho do nome`

Calculado medindo o nome do usuário.

Fórmula: `Comprimento do nome * 0.009`

Observações:
  - <b>Caso o comprimento do nome seja menor, ou igual, a `15`. O valor do subíndice sempre será `0.15`</b>
  - Como o valor do subíndice deve ser tratado como porcentagem, caso o resultado da fórmula seja maior que `1`, o valor será sempre `1`.
<br />
<br />

### `Tamanho do nome de usuário`

Calculado medindo a handle/arroba.

Fórmula: `Comprimento da handle/arroba * 0.012`

Observações:
  - <b>Caso o comprimento do nome seja menor, ou igual, a `10`. O valor do subíndice sempre será `0.15`</b>
  - Como o valor do subíndice deve ser tratado como porcentagem, caso o resultado da fórmula seja maior que `1`, o valor será sempre `1`.
<br />
<br />

### `Tamanho da descrição`
Calculado medindo o comprimento descrição.

Fórmula: `1 - (Comprimento da descrição * 0.1)`

Observações:
  - <b>Caso o comprimento do nome seja menor, ou igual, a `10`. O valor do subíndice sempre será `0.15`</b>
  - Como o valor do subíndice deve ser tratado como porcentagem, caso o resultado da fórmula seja maior que `1`, o valor será sempre `1`.
<br />
<br />

### `Idade`

Calculado utilizando a quantidade de dias desde a data de criação da conta.

Fórmula: `1 - (Idade da conta * 0.001) `

Observações:
  - <b>Caso a conta tenha uma idade menor, ou igual, a `90 dias`. O valor do subíndice sempre será `1`</b>
  - Como o valor do subíndice deve ser tratado como porcentagem, caso o resultado da fórmula seja maior que `1`, o valor será sempre `1`.
  - O valor mínimo do subíndice, é `0`.
<br />
<br />

### `Pontuação da Imagem`

Calculado verificando a existência de uma foto de perfil. <b>Caso a conta possua uma foto de perfil, o valor do subíndice será `0.15`, caso contrário, `1`</b>.
<br />
<br />

### `Tweets por dia`

Calculado utilizando o total de tweets, da amostra, da conta e a data de criação da conta.

Fórmula: `(Total de tweets / Quantidade de dias desde a criação) * 0.05`

Observações:
  - Este subíndice pode ter um valor maior que 1.
<br />
<br />

### `Pontuação de Favoritos`

Calculado utilizando a contagem de tweets favoritados pela conta.

Fórmula: `1 - (Quantidade de favoritos * 0.01)`
<br />
<br />

## Comentários sobre subíndices
## Contas verificadas 
Uma conta de twitter verificada (etiqueta azul), significa que a conta foi verificada por um agente humano, que confirmou que a conta é autêntica. A conta teve que prover muita informação e valida-la com um número de telefone para receber esse selo. Podemos presumir que um perito em avaliar contas sempre será melhor que um algoritmo, então nós confiamos nele.

## Valor base de 0,15
O valor base poderia ser 0, mas significaria que começamos considerando todos os perfis como humanos. Essa não é a melhor escolha. Caso fosse 1, então começaríamos presumindo que todas as contas verificadas são bots, o que é pior. <b>O número oficial do twitter é que 15% das contas são bots</b>. Então usamos esse valor base (0,15) para nossos cálculos.

## Comparação entre o nome e o "@"/screen name
Na maior parte do tempo, humanos criam um nome de usuário similar com seu próprio nome. Um bot pode, as vezes, gerar dois nomes completamente diferentes também. Existem alguns bots oficiais que colocam "bot" nos seus nomes. Se isso acontecer, a pontuação de similiaridade será 1. 

## Tamanho do nome, "@"/screen name e descrição
Um nome ou nome de usuário longos são suspeitos, os nomes de humanos geralmente não usam muitos caracteres. Mas se um bot gera um nome aleatório, pode ser maior que o normal.

Para a descrição, é o oposto, um bot tem mais chances de ter uma descrição vazia, ou uma muito
curta, ao invés de uma longa.

O número normal de dígitos (se houver) em um nome, é geralmente dois para um humano, que pode representar os dois  primeiros números de um código postal, a idade do usuário, ou o ano de nascimento do usuário. Mais que dois se torna suspeito, e pode ser um indício que o nome foi gerado aleatoriamente.

## Idade da conta
Se você precisa checar uma conta nova do Twitter (mais nova que 3 meses) podemos considerar a conta suspeita. Então usamos o valor de 1 para a média. Depois de 3 meses, a pontuação passa a decrescer, com um mínimo de 0, para cada dia desde que a conta foi criada. 

## Tweets por dia

Tweets por dia é a única pontuaçãio que não tem um valor máximo, se um usuário pode postar mais de 5000 tweets em um dia, quase com certeza é um bot, então a pontuação máxima não é limitada na sua influência na média. 

## Foto de perfil

A maioria dos bots não tem uma foto de perfil, então o valor de 1 é usado se não tiver imagem de perfil.

<!--  Existem muitos tipos de bots, as vezes eles trabalham sozinho e só tentam seguir muitas pessoas para 
terem muito seguidores em troca e serem mais influentes. As vezes, os bots são automaticamente seguidos
por todos os outros bots em uma mesma rede. Um usuário humano normal geralmente tem um número de seguidores
próximo do número de amigos. Quanto mais a razão estiver longe de 1, mais a conta é considerada bot. -->
<br />

# Testes / Exempos:

```
Perfil | Nosso resultado | Resultado do Botometer | Resultado real
```
```
@sunneversets100 68% 61% Bot
@Betelgeuse_3 42% 47% Bot
@infinite_scream 41% 44% Bot
@tinycarebot 45% 35% Bot
@EarthquakesSF 28% 35% Bot
@KookyScrit 18% 19% Bot
@factbot1 38% 38% Bot
@IvanDuque 0% 48% Human
@leorugeles 23% 16% N/A
@roiberhol 39% 56% N/A
@jocamacho10 21% 32% N/A
@LaGallo92 15% 15% N/A
@lolitotani 25% 19% N/A
@Ricardo57517052 60% 58% N/A
@AnavortizV 41% 56% N/A
@tavo1283 44% 21% N/A
@Andresf24091961 60% 56% N/A
@seperbupe 32% 52% N/A
@Jguarin1014 28% 29% N/A
@OmarLop18383024 62% 59% N/A
```

**A maioria dos bots testados são bots conhecidos de uma página oficial, seus perfis são, geralmente, completados por um humano.**
<br />
<br />
# Possibilidades de melhoria

- Melhorar o calculo médio incluindo um coeficiente para cada subíndice. Para isso, é necessário
determinar qual pontuação carrega o maior peso no calculo desejado.
- Usar uma API externa para encontrar a imagem de perfil do usuário na internet. Pode ser uma foto de um
lugar público (por exemplo, a Torre Eiffel), de um banco de imagem (por exemplo, Shutterstock), ou de outro
perfil em uma rede social;
- Usar uma API para reconhecimento de imagem. Por exemplo: se a foto de perfil retrata uma mulher, mas o nome da conta 
tem um nome ou nome de usuário masculino, pode ser um bot. É comum para bots que geram tudo aleatoriamente serem assim.
- Mais informação para analisar.
- Melhorar o cálculo de cada subindex.


