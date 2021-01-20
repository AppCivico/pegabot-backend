export default {
    FULL_ANALYSIS_PTBR: {
        PROFILE: {
            LABEL: 'Perfil',
            DESCRIPTION: '<p>Algumas das informações públicas dos perfis consideradas na análise do PEGABOT são o nome do perfil do usuário, e quantos caracteres ele possui, quantidade de perfis seguidos (following) e seguidores (followers), texto da descrição do perfil, número de postagens (tweets) e favoritos. Após coletar as informações, os algoritmos do PEGABOT processam e transformam os dados recebidos em variáveis que compõem o cálculo final de probabilidade.</p>',
            
            VERIFIED_ANALYSIS: {
                TITLE: 'SELO DE VERIFICAÇÃO',
                DESCRIPTION: 'A presença do selo de verificação oferecido pelo Twitter influencia positivamente nos resultados, uma vez que a plataforma possui um procedimento manual para validar a identidade desses usuários.',
            },

            SIMILARITY_ANALYSIS: {
                TITLE: 'SEMELHANÇA DE NOME DO USUÁRIO E NOME DO PERFIL',
                DESCRIPTION: 'Compara cada uma das letras que compõe o nome do usuário (arroba/handle) e o nome que aparece no perfil. Caso exista a palavra "bot", um peso maior será adicionado.'
            },

            DIGIT_ANALYSIS: {
                TITLE: 'NÚMERO DE DÍGITOS NO NOME DO USUÁRIO',
                DESCRIPTION: 'Busca por uma composição de nome de perfil que contenha lertas e números. Caso exista uma quantidade superior a dois dígitos na composição, um peso maior é adicionado.'
            },

            LENGHT_PROFILE_ANALYSIS: {
                TITLE: 'COMPRIMENTO DO NOME DO PERFIL',
                DESCRIPTION: 'Pesos maiores são adicionados em nomes que possuem uma quantidade superior a 15 caracteres.'
            },

            LENGHT_HANDLE_ANALYSIS: {
                TITLE: 'COMPRIMENTO DO NOME DO USUÁRIO (OU ARROBA)',
                DESCRIPTION: 'Pesos maiores são adicionados em nomes de usuários que possuem uma quantidade superior a 10 caracteres.'   
            },
            
            LENGHT_DESCRIPTION_ANALYSIS: {
                TITLE: 'COMPRIMENTO DA DESCRIÇÃO',
                DESCRIPTION: 'Pesos maiores são adicionados em descrições que possuem uma quantidade inferior a 10 caracteres.'   
            },

            AGE_ANALYSIS: {
                TITLE: 'IDADE DO PERFIL',
                DESCRIPTION: 'Perfis com uma data de criação inferior a 3 meses (90 dias) ganham uma pontuação maior.'   
            },

            PROFILE_PIC_ANALYSIS: {
                TITLE: 'FOTO DO PERFIL',
                DESCRIPTION: 'Verificamos a existência de uma foto de perfil. Perfis que não possuem, recebem uma pontuação maior.'   
            },

            TWEET_NUMBER_ANALYSIS: {
                TITLE: 'NÚMERO DE TWEETS',
                DESCRIPTION: 'Perfis que tuitam muito em um curto intervalo de tempo recebem uma pontuação maior.'   
            },

            FAVORITES_ANALYSIS: {
                TITLE: 'FAVORITOS',
                DESCRIPTION: 'A quantidade de favoritos de um perfil também é considerada. Perfis com maior quantidade de favoritos recebem uma pontuação maior.'   
            },
        },
        NETWORK: {
            LABEL: 'Rede',
            DESCRIPTION: '<p>O algoritmo do PegaBot coleta uma amostra da linha do tempo do usuário, identificando hashtags utilizadas e menções ao perfil para realizar suas análises. O objetivo é identificar características de distribuição de informação na rede da conta analisada.</p>O índice de rede avalia se o perfil possui uma frequência alta de repetições de menções e hashtags. No caso de um bot de spams, geralmente se usam as mesmas hashtags/menções, e é isso que esse índice observa. Por exemplo, se 50 hashtags são usadas e são 50 hashtags diferentes, não é suspeito, mas se só uma hashtag é usada 100% das vezes, então é muito suspeito.</p>',
            
            HASHTAGS_ANALYSIS: {
                TITLE: 'DISTRIBUIÇÃO DAS HASHTAGS',
                DESCRIPTION: '<p>Calcula o tamanho da distribuição dessas hashtags na rede. Ou seja, avalia se a utilização de hashtags do perfil apresenta uma frequência anormal.</p><p>Quanto mais próximo de 0% menor a probabilidade de ser um comportamento de bot.</p>'
            },

            MENTIONS_ANALYSIS: {
                TITLE: 'DISTRIBUIÇÃO DAS MENÇÕES',
                DESCRIPTION: '<p>Calcula o tamanho da distribuição de menções ao perfil do usuário na rede. Ou seja, avalia as menções realizadas pelo perfil com base em sua frequência.</p><p>Quanto mais próximo de 0% menor a probabilidade de ser um comportamento de bot.</p>'
            },

            NETWORK_ANALYSIS: {
                TITLE: 'HASHTAGS E MENÇÕES',
                DESCRIPTION: 'Com os scores das hashtag e das menções descobertos, enfim é calculado o valor final do índice de rede. A partir da soma entre a média entre os scores de hashtag e de menções (score distribuído) e da média da rede (somatória de todas hashtags e menções, dividido pelo tamanho da amostra de tweets multiplicado por 2)'
            },

            HASHTAG_LIST: {
                TITLE: 'HASHTAGS MAIS UTILIZADAS'
            },

            MENTIONS_LIST: {
                TITLE: '@MENÇÕES'
            }
        },
        EMOTIONS: {
            LABEL: 'Sentimentos',
            DESCRIPTION: '<p>Após coletar os dados, os algoritmos do PEGABOT fornecem uma pontuação, em uma escada de -5 a 5m de cada uma das palavras dos tweets coletados. A classificação se baseia em uma biblioteca, onde, cada uma das palavras possui uma pontuação, sendo considerada mais ou menos negativa, positiva ou neutra. Assim, ao final da classificação, calcula-se a pontuação média para a quantidade de palavras positivas, negativas e neutras utilizadas pelo usuário.</p>',
        }
    },
    FULL_ANALYSIS_ESMX: {
        PROFILE: {
            LABEL: 'Perfil',
            DESCRIPTION: '<p>Algunas de las informaciones públicas de los perfiles consideradas en el análisis de ATRAPABOT son: el nombre del perfil de usuario y cuantos caracteres posee, la cantidad de perfiles seguidos (following) y seguidores (followers), texto de la descripción del perfil, número de publicaciones (tuits) y favoritos.  Después de recopilar las informaciones de los datos, ATRAPABOT los proccesa y los transforma en variables que componen el cálculo final de la probabilidad.</p>',
            
            VERIFIED_ANALYSIS: {
                TITLE: 'SELLO DE VERIFICACIÓN',
                DESCRIPTION: 'La presencia del sello de verificación ofrecido por Twitter influye positivamente en los resultados, una vez que la plataforma posee un procedimiento manual para validar la identidad de esos usuarios.',
            },

            SIMILARITY_ANALYSIS: {
                TITLE: 'SEMEJANZA ENTRE EL NOMBRE DE USUARIO Y NOMBRE DE PERFIL',
                DESCRIPTION: 'Compara cada una de las letras que componen el nombre del usuario (arroba/handle) y el nombre que aparece en el perfil. Caso exista la palabra "bot", se añadirá un mayor peso.'
            },

            DIGIT_ANALYSIS: {
                TITLE: 'NÚMERO DE DÍGITOS EN EL NOMBRE DE USUARIO',
                DESCRIPTION: 'Busca una composición de nombre de perfil que contenga letras y números. Caso haya una cantidad superior a dos dígitos en la composición, se añadirá un mayor peso.'
            },

            LENGHT_PROFILE_ANALYSIS: {
                TITLE: 'LONGITUD DEL NOMRE DE PERFIL',
                DESCRIPTION: 'Se añaden mayores pesos a nombres que poseen una cantidad superior a 15 caracteres.'
            },

            LENGHT_HANDLE_ANALYSIS: {
                TITLE: 'LONGITUD DEL NOMBRE DE USUARIO (O ARROBA)',
                DESCRIPTION: 'Se añaden mayores pesos a nombres que poseen una cantidad superior a 10 caracteres.'   
            },
            
            LENGHT_DESCRIPTION_ANALYSIS: {
                TITLE: 'LONGITUD DE LA DESCRIPCIÓN',
                DESCRIPTION: 'Se añaden mayores pesos a nombres que poseen una cantidad inferior a 10 caracteres.'   
            },

            AGE_ANALYSIS: {
                TITLE: 'IDADE DEL PERFIL',
                DESCRIPTION: 'Perfiles con una fecha de creación inferior a 3 meses (90 días) reciben una calificación mayor.'   
            },

            PROFILE_PIC_ANALYSIS: {
                TITLE: 'FOTO DE PERFIL',
                DESCRIPTION: 'Verificamos la existencia de una foto de perfil.Perfiles que no la poseen reciben una calificación mayor.'   
            },

            TWEET_NUMBER_ANALYSIS: {
                TITLE: 'NÚMERO DE TUITS',
                DESCRIPTION: 'Perfiles que tuitean mucho en un breve intervalo de tiempo reciben una calificación mayor.'   
            },

            FAVORITES_ANALYSIS: {
                TITLE: 'FAVORITOS',
                DESCRIPTION: 'También se lleva en cuenta la cantidad de favoritos de un perfil. Perfiles con mayor cantidad de favoritos reciben una calificación mayor.'   
            },
        },
        NETWORK: {
            LABEL: 'Red',
            DESCRIPTION: '<p>El algoritmo de AtrapaBot recopila una muestra de línea del tiempo, identificando hasgtags utilizados y menciones al perfil, para realizar sus análisis. El objetivo es identificar caracteristicas de distribución en la red de la cuenta analizada. </p>El índice de red evalua se el perfil pose una alta frecuencia de repeticiones de menciones y hashtags. En el caso de un bot de spams, generalmente se utilizan las mismas hashtags/menciones, y es justo eso lo que ese índice observa. Por ejemplo, si se utilizan 50 hastags diferentes, no hay mucha sospecha, pero, si sólo se utiliza una misma hastag en 100% de los casos, hay mucha sospecha.</p>',
            
            HASHTAGS_ANALYSIS: {
                TITLE: 'DISTRIBUCIÓN DE LOS HASHTAGS',
                DESCRIPTION: '<p>Calcula el tamaño de la distribución de los hashtags en la red. O sea, evalua si la utilización de los hashtags del perfil presenta una frequencia anormal. </p><p>Cuanto más se acerca a 0%, menor la probabilidad de ser un comportamiento de bot.</p>'
            },

            MENTIONS_ANALYSIS: {
                TITLE: 'DISTRIBUCIÓN DE LAS MENCIONES',
                DESCRIPTION: '<p>Calcula el tamaño de la distribución de las menciones al perfil del usuario en la red. O sea, evalua las menciones realizadas por el perfil basado en su frecuencia. </p><p>Cuanto más se acerca a 0%, menor la probabilidad de ser un comportamiento de bot.</p>'
            },

            NETWORK_ANALYSIS: {
                TITLE: 'HASHTAGS Y MENCIONES',
                DESCRIPTION: 'Con los scores de los hashtags y de las menciones descobiertos, por fin se calcula el valor final del índice de la red. A partir de la suma de la media entre las calificaciones de hashtags y de menciones (calificaciones distribuidas) y de la media de la red (suma de todos los hashtags y menciones, dividido por el tamaño de la muestra de tuits y multiplicado por 2)'
            },

            HASHTAG_LIST: {
                TITLE: 'HASHTAGS MÁS UTILIZADOS'
            },

            MENTIONS_LIST: {
                TITLE: '@MENCIONES'
            }
        },
        EMOTIONS: {
            LABEL: 'Sentimentos',
            DESCRIPTION: '<p>Después de recopilar los datos, los algoritmos de Atrapabot proporcionan una calificación en una escala de -5 a 5, de cada una de las palabras de los tuits recopilados. La clasificación está basada en una biblioteca, en la cual cada una de las palabras posee una calificación, considerándola más o menos negativa. De esa manera, al fin de la clasificación se calcula la calificación media para la cantidad de palabras positivas, negativas y neutras utilizadas por el usuario.</p>'
        }
    },
};
