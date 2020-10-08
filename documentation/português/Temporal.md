Este módulo analisa o tempo de atividade da conta.

# Endpoint da API do Twitter utilizado para coleta de dados
* friends/list

# Dados coletados para a análise
* A data de todos os tweets postados na amostra da timeline
* Idade do perfil
<br />

# Validação dos dados coletado
 * Inserididos todo os dados dos tweets postados em um array. Ou seja, um array de tweets.

# Lista de subíndices

* Tempo entre dois tweets
* Razão entre tweets por dia

# Cálculo de probabilidade

- Subtração da data de criação de um tweet pela data do tweet anterior. E inserção deste resultado em um array. 
- Divisão do número total de tweets pelo número de dias desde que o perfil foi criado e multiplicação, deste resultado, por 0.025 para reduzir seu impacto na pontuação final.

Então, para conseguir a pontuação temporal, é adicionado 2 no comprimento do array de distribuição e é divido o resultado pelo tamanho da amostra. O resultado é removido de um. Por fim, a pontuação de razão dos tweets é adicionada a pontuação final.

**Pontuação = (1 - (Tamanho do array de distribuição + 2) / Número de datas) + (pontuação de razão dos tweets * 0.025)**

Mais explicações:
Um bot pode ser agendado para enviar um tweet a cada X segundos, minutos ou horas. Esse índice está aqui para contar isso.
Em caso de tweets que não parecem agendados, nós também pegamos a razão de tweets desde o dia de criação da conta,
um número muito alto é suspeito.
