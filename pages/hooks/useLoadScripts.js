import { useEffect } from "react";

const useLoadScripts = (scripts) => {
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    scripts.forEach((src) => {
      loadScript(src).catch((err) =>
        console.error(`Failed to load script ${src}`, err)
      );
    });
  }, [scripts]);
};

export default useLoadScripts;
