export function getBarcodePadding(
  textWidth: number,
  barcodeWidth: number,
  options: { displayValue: any; textAlign: string },
) {
  if (options.displayValue && barcodeWidth < textWidth) {
    if (options.textAlign == 'center') {
      return Math.floor((textWidth - barcodeWidth) / 2);
    } else if (options.textAlign == 'left') {
      return 0;
    } else if (options.textAlign == 'right') {
      return Math.floor(textWidth - barcodeWidth);
    }
  }
  return 0;
}
