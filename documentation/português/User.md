<!-- **Chave de usuário do perfil:** -->
# Dados coletados para análise
* Nome
* Nome de usuário (screen name / @)
* Descrição
* Etiqueta de verificação do Twitter
* Imagem de perfil
* Número de seguidores
* Número de amigos
* Data de criação 
* Número de Tweets
* Número de Favoritos
<br />
<br />
# Validação dos dados coletados
* Número de caracteres no nome
* Número de caracteres no nome de usuário, ou seja, o "@"/screen name
* Busca pela subpalavra "Bot" no nome ou no nome de usuário
* Asserção da similaridade entre nome e nome de usuário, após remoção de espaços e underscores
* Número de caracteres na descrição
* Idade da conta em dias.
* Número de tweets postados por dia
<br />
<br />

# Lista de subíndices

- Similaridade entre nome e nome de usuário
- Número de dígitos no nome de usuário
- Tamanho do nome
- Tamanho do nome de usuário
- Tamanho da descrição
- Idade
- Tweets por dia
- Favoritos
- Imagem de perfil

# Cálculo de probabilidade:
**Verificar [código fonte](https://github.com/AppCivico/pegabot-backend/blob/master/src/index/user.mjs) deste módulo para comprovar, e visualizar, os cálculos.**

Os resultados dos cálculos listados abaixo são atribuidos a variáveis que serão utilizadas no final do módulo para obter uma pontuação média.

Observações:
* O resultado, ou seja o retorno, varia entre 0 e 1.
* Se a conta foi verificada pelo Twitter, o resultado final, ou seja o retorno, sempre será 0.
* Valor base de cada subíndice: 0,15.

Cálculos:
- Pontuação de similaridade é calculada compartando o número de letras e cada letra em comum entre o nome e o nome de usuário,
a variação é entre 0 e 1. Se o nome ou nome de usuário contêm a subpalavra "bot", esse valor será 1.
- Número de digitos: Se tem mais que dois dígitos, o número de dígitos é multiplicado por 0.12, máximo é 1.
Se não, o valor base é mantido.
- Tamanho do nome: se tiver mais que 15 caracteres, o tamanho é multiplicado por 0.009, máximo é 1.
Se não, o valor base é mantido.
- Tamanho do nome de usuário: se tiver mais que 10 caracteres, o tamanho é multiplicado por 0,012, máximo é 1.
Se não, o valor base é mantido.
- Tamanho da descrição: se tiver menos que 10 caracteres, o tamanho é multiplicado por 0.1 e removido de 1 (mínimo é 0).
Se não, o valor base é mantido.
- Idade: Se for mais que 90 dias (3 meses), a idade é multiplicada por 0.001 e removida de 1 (mínimo é 0)
Se não, o 1.
- Pontuação da Imagem: Se não tiver foto de perfil, pontuação é 1. Se tem imagem, usa valor base.
- Tweets por dia: Número de tweets por dia multiplicados por 0.05 (sem limite máximo).
- Pontuação de Favoritos: O número de favoritos é multiplicado por 0.01 e removido de 1, minímo de 0.

Então, uma média de todos os subíndices é calculada e usada como pontuação do usuário.

## Contas verificadas 
Uma conta de twitter verificada (etiqueta azul), significa que a conta foi verificada por um agente humano,
que confirmou que a conta é autêntica. A conta teve que prover muita informação e valida-la com um número de 
telefone. Podemos presumir que um perito em avaliar contas sempre será melhor que um algoritmo, então
nós confiamos nele.

## Valor base de 0,15
O valor base poderia ser 0, mas significaria que começamos considerando todos os perfis como humanos. Essa não é a melhor escolha.
Poderia ser 1, então começaríamos presumindo que todas as contas verificadas são bots, o que é pior.
O número oficial do twitter é que 15% das contas são bots. Então usamos esse valor base (0,15) para nossos calculos.

## Comparação entre o nome e o "@"/screen name
Na maior parte do tempo, humanos criam um nome de usuário similar com seu proprio nome. Um bot pode, as vezes,
gerar dois nomes completamente diferentes também. Existem alguns bots oficiais que colocam "bot" nos seus nomes.
Se isso acontecer, a pontuação de similiaridade será 1. 

## Tamanho do nome, "@"/screen name e descrição
Um nome ou nome de usuário longos são suspeitos, os nomes de humanos geralmente não usam muitos caracteres.
Mas se um bot gera um nome aleatório, pode ser maior que o normal.

Para a descrição, é o oposto, um bot tem mais chances de ter uma descrição vazia, ou uma muito
curta, ao invés de uma longa.

O número normal de dígitos (se houver) em um nome, é geralmente dois para um humano, que pode representar os dois 
primeiros números de um código postal, a idade do usuário, ou o ano de nascimento do usuário. Mais que dois se torna
suspeito, e pode ser um indício que o nome foi gerado aleatoriamente.

## Idade da conta
Se você precisa checar uma conta nova do Twitter (mais nova que 3 meses) podemos considerar a conta suspeita.
Então usamos o valor de 1 para a média. Depois de 3 meses, a pontuação passa a decrescer, com um mínimo de 0,
para cada dia desde que a conta foi criada. 

## Tweets por dia
Tweets por dia é a única pontuaçãio que não tem um valor máximo, se um usuário pode postar mais de 5000 tweets
em um dia, quase com certeza é um bot, então a pontuação máxima não é limitada na sua influência na média. 

## Foto de perfil
A maioria dos bots não tem uma foto de perfil, então o valor de 1 é usado se não tiver imagem de perfil.

<!--  Existem muitos tipos de bots, as vezes eles trabalham sozinho e só tentam seguir muitas pessoas para 
terem muito seguidores em troca e serem mais influentes. As vezes, os bots são automaticamente seguidos
por todos os outros bots em uma mesma rede. Um usuário humano normal geralmente tem um número de seguidores
próximo do número de amigos. Quanto mais a razão estiver longe de 1, mais a conta é considerada bot. -->
<br />
<br />

# Testes / Exempos:

```
Perfil | Nosso resultado | Resultado do Botometer | Resultado real
```
```
@sunneversets100 68% 61% Bot
@Betelgeuse_3 42% 47% Bot
@infinite_scream 41% 44% Bot
@tinycarebot 45% 35% Bot
@EarthquakesSF 28% 35% Bot
@KookyScrit 18% 19% Bot
@factbot1 38% 38% Bot
@IvanDuque 0% 48% Human
@leorugeles 23% 16% N/A
@roiberhol 39% 56% N/A
@jocamacho10 21% 32% N/A
@LaGallo92 15% 15% N/A
@lolitotani 25% 19% N/A
@Ricardo57517052 60% 58% N/A
@AnavortizV 41% 56% N/A
@tavo1283 44% 21% N/A
@Andresf24091961 60% 56% N/A
@seperbupe 32% 52% N/A
@Jguarin1014 28% 29% N/A
@OmarLop18383024 62% 59% N/A
```

**A maioria dos bots testados são bots conhecidos de uma página oficial, seus perfis são, geralmente, completados por um humano.**
<br />
<br />
# Possibilidades de melhoria

- Melhorar o calculo médio incluindo um coeficiente para cada subíndice. Para isso, é necessário
determinar qual pontuação carrega o maior peso no calculo desejado.
- Usar uma API externa para encontrar a imagem de perfil do usuário na internet. Pode ser uma foto de um
lugar público (por exemplo, a Torre Eiffel), de um banco de imagem (por exemplo, Shutterstock), ou de outro
perfil em uma rede social;
- Usar uma API para reconhecimento de imagem. Por exemplo: se a foto de perfil retrata uma mulher, mas o nome da conta 
tem um nome ou nome de usuário masculino, pode ser um bot. É comum para bots que geram tudo aleatoriamente serem assim.
- Mais informação para analisar.
- Melhorar o cálculo de cada subindex.


