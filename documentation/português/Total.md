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
