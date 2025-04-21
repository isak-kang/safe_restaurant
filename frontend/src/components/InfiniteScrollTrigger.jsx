import { useEffect, useRef } from "react";

export default function InfiniteScrollTrigger({ onIntersect, hasMore }) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 1.0 }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [onIntersect, hasMore]);

  return <div ref={triggerRef} style={{ height: "1px" }} />;
}
