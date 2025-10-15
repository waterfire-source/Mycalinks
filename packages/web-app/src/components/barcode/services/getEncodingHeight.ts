interface EncodingHeightOptions {
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  textMargin?: number;
  marginTop?: number;
  marginBottom?: number;
}

export function getEncodingHeight(
  encoding = { text: '' },
  options: EncodingHeightOptions = {},
) {
  const {
    height = 0,
    displayValue = false,
    fontSize = 0,
    textMargin = 0,
    marginTop = 0,
    marginBottom = 0,
  } = options;
  return (
    height +
    (displayValue && encoding.text?.length > 0 ? fontSize + textMargin : 0) +
    marginTop +
    marginBottom
  );
}
