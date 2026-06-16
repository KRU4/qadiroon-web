import { useEffect } from "react";
import { api } from "../../lib/api";

export function CodeSnippetsInjector() {
  useEffect(() => {
    api
      .publicSnippets()
      .then((snippets) => {
        snippets.forEach((s) => {
          if (s.type === "head") {
            const el = document.createElement("div");
            el.innerHTML = s.code;
            el.childNodes.forEach((node) => {
              if (node.nodeName === "SCRIPT") {
                const script = document.createElement("script");
                script.textContent = (node as HTMLScriptElement).textContent;
                document.head.appendChild(script);
              } else {
                document.head.appendChild(node.cloneNode(true));
              }
            });
          }
        });
      })
      .catch(() => {});
  }, []);

  return null;
}
