Este módulo analisa a dinâmica entre o perfil informado e seus amigos.

# Endpoint da API do Twitter utilizado para coleta de dados
**/followers/list**

# Dados coletados para análise
* Diferença no UTC, ou seja, timezone 
* Número de seguidores
* Número de amigos
* Data de criação
* Número de Tweets
<br />

# Validação dos dados coletados
Cada dado coletado, é inserido em arrays de distribuição que contem um único elemento de elemento diferente coletado. Ou seja, há um array distinto para armazenar diferenças no timezone, números de seguidores e etc. 
Por exemplo, se tivermos o dado "Diferença no UTC" igual a UTC -03, nós só colocamos esse dado uma vez no array. 
<br />

# Lista de subíndices

- Diferença de timezone
- Idade
- Amigos
- Seguidores
- Número de Tweets
<br />

# Cálculo da probabilidade

Observações:
* Se qualquer uma das pontuações acima der mais que 1, nós limitados em 1.

Cáculos:
- Tamanho do array de diferenças dividido por 8
- Tamanho do array de idade dividido por 50
- Tamanho do array de amigos dividido por 50
- Tamanho do array de seguidores dividido por 75
- Tamanho do array de número de tweets dividido por 50

Então, para a pontuação de tudo acima, nós multiplicamos por dois a pontuação de diferenças e a adicionamos as outras pontuações. Depois, tudo é divido por 10. 

Todos os cálculos acima são feitos uma vez para os amigos do perfil analisado e uma vez para os seguidores do perfil. Assim que conseguimos as duas pontuações, nós calculamos o índice final de amigo multiplicando a pontuação de seguidores por 1,5 e somando com a pontuação do amigo. Por fim, a dividimos por 3.

## Diferença de timezone
A pontuação de diferença é a mais importante, por isso ela é contada duas vezes na pontuação final. 
Não é muito comum um usuário ter amigos/seguidores de muitos fuso horários diferentes. Nós consideramos que outros tipos de dados geralmente são diferentes e pensam menos na pontuação final.

## Número de amigos e de seguidores
A pontuação de amigos é mais importante que a pontuação de seguidores já que amigos são escolhidos pelo usuário,
então essa pontuação conta 1.5x mais na pontuação final.

