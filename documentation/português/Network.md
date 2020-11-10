Este módulo analisa a dinâmica entre o perfil informado e seus amigos.

# Endpoint da API do Twitter utilizado para coleta de dados
* statuses/user_timeline

# Dados coletados para análise
* Todas as hashtags usadas na amostra da timeline
* Todas as menções usadas na amostra da timeline
* Tamanho da amostra
<br />

# Validação dos dados coletados
* Para cada dado coletado, é inserido em um array de distribuição que contem um único elemento  de cada elemente diferente coletado. (Por exemplo, se temos cinco vezes a hashtag "#eleições", nós colocamos esse dados só uma vez no array.)
* Para menções, não contamos uma menção se pertencer uma resposta.

# Lista de subíndices:

- Tamanho da distribuição para hashtags
- Tamanho da distribuição para menções
- Total de hashtags e menções

# Cálculo de probabilidade:

- Contagem do tamanho da distribuição de menções
- Contagem do tamanho da distribuição de hashtags
- Consegue a pontuação média de rede adicionando o número de hashtags na amostra com o número de menções e divide pelo tamanho da amostra multiplicado por dois.

Então, nós dividimos o tamanho da distribuição de hashtags pelo total de hashtags que temos na amostra, por exemplo, se nós temos só 5 hashtags diferentes por um total de 50 hashtags usadas na amostra, nós dividimos 5 por 50. 

Fazemos o mesmo com as menções e removemos ambas as pontuações de 1.

Depois, calculamos a média das duas pontuações e somamos-as a pontuação média da rede.

O algoritmo do PegaBot coleta uma amostra da linha do tempo do usuário, identificando hashtags utilizadas e menções ao perfil para realizar suas análises. O objetivo é identificar características de distribuição de informação na rede da conta analisada.

O índice de rede avalia se o perfil possui uma frequência alta de repetições de menções e hashtags. No caso de um bot de spams, geralmente se usam as mesmas hashtags/menções, e é isso que esse índice observa. Por exemplo, se 50 hashtags são usadas e são 50 hashtags diferentes, não é suspeito, mas se só uma hashtag é usada 100% das vezes, então é muito suspeito.

# Fórmula utilizada para cáculo do índice

#### Variáveis:
* <b>`Total de hashtags`</b>: 
* * Contagem de todas as hashtags utilizadas, em todos os tweets analisados para o perfil
* <b>`Total de menções`</b>: 
* * Contagem de todas as menções utilizadas, em todos os tweets analisados para o perfil
* <b>`Tamanho da amostra`</b>:
* * Contagem do tamanho da array de resposta da API do Twitter
* <b>`Número de diferentes hashtags usados`</b>:
* * Contagem de hashtags únicas, ou seja, distintas
* <b>`Número de diferentes menções usadas`</b>:
* * Contagem de menções únicas, ou seja, distintas

#### Fórmula:
**Pontuação = ( (Total de hashtags + Total de menções) / ((Tamanho da amostra * 2) ) + ( (1 - (Número de diferentes hashtags usados / Total de hashtags)) + (1 -(Número de diferentes menções usadas / Total de menções )) ) / 2)**

#### Fatores que podem influenciar as variáveis:
* Ao calcular o score distríbuido (`Total de hashtags + Total de menções / Tamanho da amostra * 2`)
* * Caso o resultado seja maior que 2, o resultado, desse trecho da equação, deve ser divido por 2
* * Caso o resultado seja igual a 1, o resultado, desse trecho da equação,deve ser 1
* Caso uma menção seja feita em um tweet de resposta, não é contabilizada na contagem "`Total de menções`"