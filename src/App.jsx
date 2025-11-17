import React, { useState } from "react";
import { translateText } from "./api";

const dictionaryEN = {
  shock: "サンダー",
  shroom: "キノコ",
  blue: "棘",
  cut: "SC",
  war: "対抗戦",
  shell: "甲羅",
  kart: "カート",
};

// 日本語→英語辞書は英語辞書を反転して作る（必要なら手動で追加してください）
const dictionaryJA = Object.fromEntries(
  Object.entries(dictionaryEN).map(([k, v]) => [v, k])
);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

function applyDict(text, direction = "EN-JA") {
  let out = text;
  const dict = direction === "JA-EN" ? dictionaryJA : dictionaryEN;
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    let pattern;
    if (direction === "JA-EN") {
      // 日本語は単語境界が使えないため、単純な部分一致で置換（グローバル・大文字小文字区別なしは不要）
      pattern = new RegExp(escapeRegExp(k), "g");
    } else {
      // 英語は単語境界を使って正確に置換
      pattern = new RegExp("\\b" + escapeRegExp(k) + "\\b", "gi");
    }
    out = out.replace(pattern, dict[k]);
  }
  return out;
}

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState("EN-JA");

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const preProcessed = applyDict(input);
      const [src, tgt] = direction.split("-");
      const result = await translateText(preProcessed, { source: src, target: tgt });
      setOutput(result);
    } catch (e) {
      setOutput("翻訳エラー: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>マリオカート用翻訳Webアプリ</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="英語の文章を入力"
      />

        <div className="controls">
          <label htmlFor="direction">翻訳方向: </label>
          <select id="direction" value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="EN-JA">英語 → 日本語</option>
            <option value="JA-EN">日本語 → 英語</option>
          </select>
          <div className="char-count">文字数: {input.length}</div>
        </div>

      <button onClick={handleTranslate} disabled={loading}>
        {loading ? "翻訳中..." : "翻訳する"}
      </button>

      <div className="output">{output}</div>
    </div>
  );
}