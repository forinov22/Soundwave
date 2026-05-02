import { useEffect, useRef, useState } from "react";

// Возвращает ref который нужно повесить на элемент-триггер,
// и флаг isIntersecting — true когда элемент входит в viewport.
//
// Использование:
//   const { ref, isIntersecting } = useIntersection({ threshold: 0.1 });
//   useEffect(() => { if (isIntersecting && hasMore) loadMore(); }, [isIntersecting]);
//   ...
//   <div ref={ref} />
export function useIntersection(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, ...options },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}
