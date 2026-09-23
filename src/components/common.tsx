import { useCallback, useEffect, useState } from 'react';

export function useStored<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: keep in memory */
    }
  }, [key, value]);
  return [value, setValue];
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1400);
  }, [text]);
  return (
    <button type="button" className={`btn${done ? ' done' : ''}`} onClick={copy}>
      {done ? 'Copied' : label}
    </button>
  );
}

export function PromptBlock({ title, text, footer }: { title: string; text: string; footer?: string }) {
  return (
    <div className="prompt">
      <div className="prompt-head">
        <span>{title}</span>
        <CopyButton text={text} />
      </div>
      <pre>{text}</pre>
      {footer && <div className="kling">{footer}</div>}
    </div>
  );
}

export function download(name: string, text: string, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
