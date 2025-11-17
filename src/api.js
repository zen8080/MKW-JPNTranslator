export async function translateText(text) {
  const resp = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, source: "EN", target: "JA" }),
  });
  const data = await resp.json().catch(() => ({}));
  return (
    data?.translatedText ?? data?.translated_text ?? data?.translated ?? (typeof data === "string" ? data : null)
  );
}