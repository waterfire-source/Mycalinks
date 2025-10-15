import { useEffect, useRef, useState } from 'react';

/**
 * 要素がoverflow（省略表示）されているかを監視するカスタムフック
 * @returns [isOverflow, ref]
 */
export function useOverflowDetect<T extends HTMLElement>(deps: any[] = []) {
  const ref = useRef<T>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const el = ref.current;
      if (!el) return;
      setIsOverflow(
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth,
      );
    };

    checkOverflow();

    if (!ref.current) return;
    const resizeObserver = new window.ResizeObserver(checkOverflow);
    resizeObserver.observe(ref.current);

    // テキスト内容の変化にも対応
    const mutationObserver = new MutationObserver(checkOverflow);
    mutationObserver.observe(ref.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [deps]);

  return { isOverflow, ref };
}
