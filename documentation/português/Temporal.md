**Chave Temporal do perfil:**

Dados coletados:
A data de todos os tweets postados na amostra da timeline
Idade do perfil


Preparo do dado:
Colocar todo os dados dos tweets postados em um array

Lista de subíndices:

- Atraso entre dois tweets
- Razão entre tweets por dia

Cálculo de probabilidade:

- Substrair de criação de um tweet da data do tweet anterior.
Coloque essa diferença em um array se não estiver presente. 
- Divida o número de tweets total pelo número de dias desde que o perfil foi criado e multiplique-o 
por 0.025 para reduzir seu impacto na pontuação final.

Então, para conseguir a pontuação temporal, nós adicionamos 2 no comprimento do array de distribuição e dividimos o resultado
pelo tamanho da amostra. O resultado é removido de 1. Finalmentl, a pontuação de razão dos tweets é adicionada
a pontuação final.

Pontuação = (1 - (Tamanho do array de distribuição + 2) / Número de datas) + (pontuação de razão dos tweets * 0.025)

Mais explicações:
Um bot pode ser agendado para enviar um tweet a cada X segundos, minutos ou horas. Esse índice está aqui para contar isso.
Em caso de tweets que não parecem agendados, nós também pegamos a razão de tweets desde o dia de criação da conta,
um número muito alto é suspeito.
