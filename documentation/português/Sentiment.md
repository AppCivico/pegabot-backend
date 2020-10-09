**Key Network Profile:**

Dados coletados:
Uma amostra de tweets da timeline do usuário, dessa amostra são coletadas duas informações:
  -O texto de todo tweet da amostra da timeline
  -A linguagem de todo tweet da amostra da timeline
  -O tamanho da amostra

Obs: a análise de sentimento é limitada aos 100 primeiros tweets da amostra.

Preparo do dado:
Para cada tweet da timeline, busca-se a linguagem retornada pelo Twitter junto com o tweet.
Se o pedido de análise vem de uma requisição para a api do pegabots, usa-se o nome do domínio da origem para descobrir qual línguagem deveria ser a padrão. Se nenhuma línguagem for encontrada, é usado o padrão "pt".
O texto de cada um dos tweets é então analisado com o módulo npm ["multilang-sentiment"](https://www.npmjs.com/package/multilang-sentiment) para adquirir uma pontuação para cada texto. 

Para pontuar um texto, esse módulo utiliza uma lista de palavras, cada palavra tem uma pontuação representado seu sentimento. Essa lista é baseada no padrão ["AFINN"](http://www2.imm.dtu.dk/pubdb/pubs/6010-full.html), também utilizada em outros módulos.
Palavras positivas (amor, gosto) valem mais pontos, palavras negativas (ódio, detesto) valem menos pontos e palavras neutras (você, do, um) não tem pontuação nenhuma, ou seja, valem zero. Os pontos vão de -5 para 5. Para cada texto analisado, esse módulo calcula a média de pontos por palavra.



Lista de subíndices:

- A quantidade de todas as análises de sentimento com resultado neutro (0)
- Número de tweets usados

Cálculo do Sentimento:

Dessas pontuações são contadas quantos tweets analisados retornam uma pontuação "neutra", ou seja, 0. Depois é tirada a média de quantas pontuações neutras existem pela quantidade total de tweets analisados.
Dessa forma, são filtradas tanto as mensagens positivas quanto negativas. Os tweets com mensagens não-neutras não são ignorados, eles servem para diminuir a pontuação de neutralidade. 
Quanto menos neutro for o discurso de um usuário no Twitter, maior será o score de sentimento e mais chance esse usuário tem de ser um robô. 
