export const palette = {
  primary: {
    main: 'rgba(184,42,42,1)', //Mycaのテーマカラーを設定する
    contrastText: '#ffffff',
    surface: 'rgba(184,42,42, 0.1)',
    error: '#B02060',
  },
  secondary: {
    main: '#2a69b8', // 青色をsecondaryとして設定
    contrastText: '#ffffff',
  },
  text: {
    //テキストの色に使用
    primary: '#000000',
    secondary: '#ffffff',
    tertiary: '#757575',
    disabled: '#bdbdbd',
  },
  action: {
    // active: 'rgba(184,42,42,1)', // アクティブな要素の色
    // hover: '#001E3C', // ホバー時の色
    hoverOpacity: 0.08, // ホバー時の不透明度
    selected: '#001E3C', // 選択された要素の色
    selectedOpacity: 0.16, // 選択された要素の不透明度
    // disabled: '#001E3C', // 無効状態の要素の色
    // disabledBackground: '#001E3C', // 無効状態の要素の背景色
    disabledOpacity: 0.38, // 無効状態の要素の不透明度
    focus: '#001E3C', // フォーカスされた要素の色
    focusOpacity: 0.12, // フォーカスされた要素の不透明度
    activatedOpacity: 0.24, // 有効化された要素の不透明度
  },
  grey: {
    //灰色っぽい色。どこで使うかの指定はない。
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#dddddd',
    300: '#C8C8C8',
    400: '#D8D8D8',
    500: '#9e9e9e',
    600: '#757575',
    700: '#676767',
    800: '#424242',
    900: '#212121',
  },
  common: {
    //ボーダー色、背景色に使用
    black: '#000000',
    white: '#ffffff',
  },
  background: {
    default: '#F9F9F9',
  },
};
