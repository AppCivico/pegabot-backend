O Pegabot usa um sistema de cacheamento para evitar refazer análises para um mesmo usuário.
Esse sistema de cacheamento uma um banco de dados PostgreSQL.

Para cada nova análise nós salvamos 3 coisas no banco de dados:

1. A resposta da API do Twitter para o usuário requisitado
2. O Resultado das nossas análises
3. Dados complementares da análise, como valores usados para alcançar os resultados

Então, se quaisquer novas requisições para um usuário que tem salvos no banco chegar, nós simplesmente carregamos os dados da análise mais recente do tal usuário e evitamos fazer uma nova requisição para a API do Twitter e re-calcular a pontuação do usuário.

É importante lembrar que o sistema de cacheamento tem um intervalo de tempo limitado. Por padrão, é de 10 dias. Depois disso, toda nova requisição que chegar para um usuário que já temos salvo será refeita e, para os próximos 10 dias, essa nova análise será o cache do usuário.

Esse intervalo de tempo pode ser manipulado na requisição da API passando o parâmetro `cache_duration`. `cache_duration` deve ser uma string com um número e um período de tempo válido (days|hours|minutes|seconds) separados por um underline. Examplo: 10_minutes ou 2_days.

