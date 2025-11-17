export async function translateText(text) {
  // 開発時 (localhost) は外部 API を直接呼び、本番では Vercel の /api/translate を使う
  const isLocalhost = typeof location !== "undefined" && /localhost|127\.0\.0\.1/.test(location.hostname);

  const endpoint = isLocalhost
    ? "https://mkw-jpn-translator.vercel.app/translate"
    : "/api/translate";

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, source: "EN", target: "JA" }),
  });

  const data = await resp.json().catch(() => ({}));

  return (
    data?.translatedText ?? data?.translated_text ?? data?.translated ?? (typeof data === "string" ? data : null)
  );
}