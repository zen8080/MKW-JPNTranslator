import React, { useState } from "react";
import { translateText } from "./api";

const dictionary = {
  shock: "サンダー",
  shroom: "キノコ",
  blue: "棘",
  cut: "SC",
  war: "対抗戦",
  shell: "甲羅",
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

function applyDict(text) {
  let out = text;
  const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const pattern = new RegExp("\\b" + escapeRegExp(k) + "\\b", "gi");
    out = out.replace(pattern, dictionary[k]);
  }
  return out;
}

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const preProcessed = applyDict(input);
      const result = await translateText(preProcessed);
      setOutput(result);
    } catch (e) {
      setOutput("翻訳エラー: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>マリオカート スラング翻訳 Webアプリ</h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="英語の文章を入力"
      />

      <button onClick={handleTranslate} disabled={loading}>
        {loading ? "翻訳中..." : "翻訳する"}
      </button>

      <div className="output">{output}</div>
    </div>
  );
}