**Chave de rede do perfil:**

Dados para coletar:
Todas as hashtags usadas na amostra da timeline
Todas as menções usadas na amostra da timeline
Tamanho da amostra

Preparo do dado:
Para cada dado coletado, coloque-o em um array de distribuição que contem um único elemento 
de cada elemente diferente coletado. 
Por exemplo, if temos cinco vezes a hashtag "#eleições", nós colocamos esse dados só uma vez no array.
Para menções, não contamos uma menção se pertencer uma resposta.

Lista de subíndices:

- Tamanho da distribuição para hashtags
- Tamanho da distribuição para menções
- Total de hashtags e menções

Cálcula da probabilidade:

- Conta o tamanho da distribuição de menções
- Conta o tamanho da distribuição de hashtags
- Consegue a pontuação média de rede adicionando o número de hashtags na amostra com o número de menções e 
divide pelo tamanho da amostra multiplicado por dois.

Então, nós dividimos o tamanho da distribuição de hashtags pelo total de hashtags que temos na amostra,
por exemplo, se nós temos só 5 hashtags diferentes por um total de 50 hashtags usadas na amostra, nós
dividimos 5 por 50. 

Fazmos o mesmo com as menções e removemos ambas as pontuações de 1.

Depois, calculamos a média das duas pontuações e somamos-as a pontuação média da rede.

Pontuação = ((Total de hashtags + menções) / (Quantidade de dado * 2)) + ((1 - (número de diferentes hashtags usados / total de hashtags)) + (1 -(número de diferentes menções usadas / total de menções / 2 )))

Mais explicações:

O índece calcula se o perfil está spammando alguma hashtag ou usuário. Quanto mais hashtags/menções
ele tem, maior será a pontuação, a razão normal para hashtags/menções por tweet é considerada como dois.
Mais que isso, a pontuação começará a aumentar.

No caso de um bot de spams, geralmente se usam as mesmas hashtags/menções, é isso que esse índice pega.
Se 50 hashtags são usadas e são 50 hashtags diferentes, não é suspeito, mas se só uma hastag é usada 
100% das vezes, então é muito suspeito.
