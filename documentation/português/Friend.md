**Chave de amigo do perfil:**

Dados para coletar:
Diferença no UTC 
Número de seguidores
Número de amigos
Data de criação
Número de Tweets

Preparo dos dados:
Para cada dado coletano, coloque-o no array de distribuição que contem um único elemento de elemento diferente coletado.
Por exemplo, se tivermos o dado "Diferença no UTC" igual a UTC -03, nós só colocamos esse dado uma vez no array. 

Lista de subíndices:

- Diferença
- Idade
- Amigos
- Seguidores
- Número de Tweets

Cálculo da probabilidade:

- Tamanho do array de diferenças dividido por 8
- Tamanho do array de idade dividido por 50
- Tamanho do array de amigos dividido por 50
- Tamanho do array de seguidores dividido por 75
- Tamanho do array de número de tweets dividido por 50
- Se qualquer uma das pontuações acime der mais que 1, nós limitados em 1.

Então, para a pontuação de tudo acima, nós multiplicamos por dois a pontuação de diferenças e
a adicionamos as outras pontuações. Depois, tudo é divido por 10. 

Todos os cálculos acima são feitos uma vez para os amigos do perfil analisado e uma vez 
para os seguidores do perfil.
Assim que tivermos as duas pontuações, nós calculamos o índice final de amigo multiplicando a pontuação
de seguidores por 1.5 e somando com a pontuação do amigo. Por fim, a dividimos por 3.

Mais explicações:
A pontuação de diferença é a mais importante, por isso ela é contada duas vezes na pontuação final. 
Não é muito comum um usuário ter amigos/seguidores de muitos fuso horários diferentes.
Nós consideramos que outros tipos de dados geralmente são diferentes e pensam menos na pontuação final.  
A pontuação de amigos é mais importante que a pontuação de seguidores já que amigos são escolhidos pelo usuário,
então essa pontuação conta 1.5x mais na pontuação final.

