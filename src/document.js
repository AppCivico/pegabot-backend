async function getExtraDetails(extraDetails) {
  extraDetails.LINK_TYPEFORM = 'NÃO TEMOS';
  extraDetails.LEXICON_TYPE = '';
  extraDetails.LEXICON_EXAMPLE = '';

  if (extraDetails.SENTIMENT_EXAMPLE) {
    const types = [];
    const examples = [];

    const { positive } = extraDetails.SENTIMENT_EXAMPLE;
    const { negative } = extraDetails.SENTIMENT_EXAMPLE;

    if (positive && positive.length > 0) {
      types.push('positivo');
      examples.push(`-Exemplo de palavras positivas: ${positive.join(', ')}.`);
    }
    if (negative && negative.length > 0) {
      types.push('negativo');
      examples.push(`-Exemplo de palavras negativas: ${negative.join(', ')}.`);
    }

    if (types.length) extraDetails.LEXICON_TYPE = `-Exemplo de léxico ${types.length === 1 ? types[0] : types.join(' e ')}:`;
    if (examples.length) extraDetails.LEXICON_EXAMPLE = examples.join('<br>');
  }


  return extraDetails;
}

module.exports = { getExtraDetails };
