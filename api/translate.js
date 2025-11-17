export default async function handler(req, res) {
  // CORS: プリフライト (OPTIONS) に対応
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = req.body ?? {};

    // DeepL API を使う実装。API キーは環境変数 `DEEPL_API_KEY` に格納してください。
    const DEEPL_KEY = process.env.DEEPL_API_KEY;
    if (!DEEPL_KEY) {
      return res.status(500).json({ error: "DEEPL_API_KEY is not configured on the server." });
    }

    const text = body.text ?? "";
    const target = (body.target || "JA").toUpperCase();

    // DeepL (free) のエンドポイント。必要に応じて paid エンドポイントに変更してください。
    const deeplUrl = "https://api-free.deepl.com/v2/translate";

    const params = new URLSearchParams();
    params.append("auth_key", DEEPL_KEY);
    params.append("text", text);
    params.append("target_lang", target);

    const resp = await fetch(deeplUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const deeplData = await resp.json().catch(() => ({}));

    const translatedText = Array.isArray(deeplData.translations) && deeplData.translations[0]
      ? deeplData.translations[0].text
      : null;

    res.setHeader("Content-Type", "application/json");
    return res.status(resp.ok ? 200 : resp.status).json({ translatedText, raw: deeplData });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
