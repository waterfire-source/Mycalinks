//スタイルのユーティリティ（適当）
export class StyleUtil {
  public static flex = {
    col: {
      display: 'flex',
      flexDirection: 'column',
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
    },
    allCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  } as const;

  public static text = {
    bold: {
      fontWeight: 'bold',
    },
  } as const;
}
