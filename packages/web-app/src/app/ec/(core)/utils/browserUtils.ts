/**
 * 外部URLを開くためのユーティリティ
 * ReactNativeWebViewが存在する場合（アプリ内）はpostMessageで外部ブラウザを開く
 * 通常のブラウザでは新しいタブでURLを開く
 */

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export const openExternalUrl = (url: string) => {
  if (window.ReactNativeWebView) {
    // アプリ内WebViewの場合は外部ブラウザでURLを開く
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'browser_open',
        url: url,
      }),
    );
  } else {
    // 通常のブラウザでは新しいタブでURLを開く
    window.open(url, '_blank');
  }
};

/**
 * 現在のページをリダイレクトする
 * ReactNativeWebViewが存在する場合はpostMessageで外部ブラウザを開く
 * 通常のブラウザでは現在のページを遷移する
 */
export const redirectToUrl = (url: string) => {
  if (window.ReactNativeWebView) {
    // アプリ内WebViewの場合は外部ブラウザでURLを開く
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'browser_open',
        url: url,
      }),
    );
  } else {
    // 通常のブラウザでは現在のページを遷移
    window.location.href = url;
  }
};
