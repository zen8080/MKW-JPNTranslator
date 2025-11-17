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
    console.log("[translate] incoming request", { method: req.method, url: req.url });
    console.log("[translate] headers", Object.fromEntries(Object.entries(req.headers || {}).filter(([k]) => k.toLowerCase() !== 'authorization')));
    console.log("[translate] body preview", typeof body === 'string' ? body.slice(0,200) : JSON.stringify(body).slice(0,200));

    // DeepL API を使う実装。API キーは環境変数 `DEEPL_API_KEY` に格納してください。
    const DEEPL_KEY = process.env.DEEPL_API_KEY;
    if (!DEEPL_KEY) {
      console.error("[translate] DEEPL_API_KEY missing");
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

    let resp;
    let deeplData = {};
    try {
      resp = await fetch(deeplUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      deeplData = await resp.json().catch(() => ({}));
      console.log("[translate] deepl status", resp.status);
      console.log("[translate] deepl response preview", JSON.stringify(deeplData).slice(0,1000));
    } catch (fetchErr) {
      console.error("[translate] error calling DeepL:", fetchErr);
      return res.status(502).json({ error: "Failed to call DeepL API", details: fetchErr.message });
    }

    const translatedText = Array.isArray(deeplData.translations) && deeplData.translations[0]
      ? deeplData.translations[0].text
      : null;

    res.setHeader("Content-Type", "application/json");
    return res.status(resp && resp.ok ? 200 : (resp ? resp.status : 500)).json({ translatedText, raw: deeplData });
  } catch (err) {
    console.error("[translate] unexpected error", err);
    return res.status(500).json({ error: err.message, stack: err.stack?.split("\n").slice(0,5) });
  }
}
