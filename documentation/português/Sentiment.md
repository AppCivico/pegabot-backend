**Key Network Profile:**

Dados coletados:
O texto de todo tweet amostra da timeline
O língua de todo tweet amostra da timeline
O tamanho da amostra

Obs: Nós limitamos o tamanho da amostra em 100 tweets por conta de problemas de timeout na request.

Preparo do dado:
PAra cada tweet da timeline, nós tentamos encontrar a língua do tweet com a chave "lang".
Se nenhuma língua for encontrada, nós usamos o padrão "pt". 
If o pedido de análise vem de uma requisição para a api, nós olhamos o nome do domínio da origem para descobrir qual língua deveria ser a padrão. Veja a função getDefaultLanguage em "library.js".

Lista de subíndices:

- A some de todas as análises de sentimento
- Número de tweets usados

Cálculo do Sentimento:

Com a língua e texto, nós usamos o módulo npm ["multilang-sentiment"](https://www.npmjs.com/package/multilang-sentiment) para conseguir uma pontuação para cada texto.
O score do sentimento é a média dessas pontuações.

