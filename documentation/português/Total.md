## Sobre a pontuação final da análise e os índices

A pontuação total da análise não é uma simples média do subtotal das outras, ela é pesada de acordo com a importância de cada índice e também do contexto.

Por exemplo, uma pontuação de usuário igual a 0, ou seja baixa probabilidade de ser um robô, por ser uma conta oficialmente verificada, irá pesar 3 vezes mais na pontuação final, pois a probabilidade de ser um robô é muito baixa, uma vez que é realizado todo um processo de validação manual pelo Twitter.

De modo geral, as pontuações dos índices de Rede e Temporal tem um peso maior porque são mais significativas na identificação de bots. Mas elas não só tem maior peso, o cálculo independente desses índices pode ser maior que 1 (100%). Então, terão mais peso na pontuação final, mas a pontuação final nunca será maior que 100% (depois do ajuste de cálculo).

A pontuação do índice de Rede geralmente ultrapassa 1 mais que a Temporal.

Mas a pontuação dos índices exibidas nunca ultrapassa 100% porque elas são divididas e ajustadas entre serem usadas no cálculo final e serem exibidas.

Pode ser possível ter uma pontuação final maior que toda a pontuação dos outros índices.

## Dados salvos no banco

É salvo no banco a resposta JSON dos endpoints consultados (API do Twitter).

* Nome do perfil, e usuário, solicitado
* Nome de perfis, e usuário, expostos em tweets
* Datas de criação de tweets
* Conteúdo de tweets
* ID das contas análisadas
* ID das contas que tiveram tweets análisados, ou seja, o autor de uma menção, também possui seus dados coletados
* URL de tweets
* Contadores de interação dos tweets no momento da coleta, por ex: número de likes, retweets e etc

## Limites da API do Twitter e cache

Ao utilizar a API do Twitter, sempre é necessário ter em mente o sistema de limite de requisições. Para a API do Twitter, em especial, os de listagem de tweets (timeline) e de amigos, o limite é determinado em 15 requisições a cada 15 minutos.<br>

Portanto, tendo em vista a possibilidade de várias requisições para um mesmo perfil, é utilizado um sistema de caching. Que dura 2592000 segundos, ou seja, 30 dias. Isso significa que uma vez realizada uma análise, ela será mantida por 30 dias, para um determinado perfil.