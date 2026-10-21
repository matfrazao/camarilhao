import { useMemo, useRef, useState, useEffect } from "react";
import { QUESTIONS, buildIndex, suggest, norm } from "./data.js";

const STARS = Array.from({ length: 90 }, (_, i) => ({ id: i, x: (i * 37) % 100, y: 52 + ((i * 53) % 46), s: 1 + (i % 3), d: (i % 5) * 0.6 }));
const CLOUDS = [8, 14, 21, 28, 34, 40, 46];
const tier = (p) => (p >= 100 ? "💎 Raríssima" : p >= 75 ? "🔥 Obscura" : p >= 50 ? "✨ Incomum" : p >= 25 ? "👍 Comum" : "🥱 Todo mundo disse");
const verdict = (t) => (t >= 560 ? "Você é um em um Camarilhão! 🦐🚀" : t >= 400 ? "Astronauta de trivia 🛰️" : t >= 250 ? "Voou alto, hein? ☁️" : t >= 130 ? "Subiu um pouquinho 🎈" : "Ficou rente ao chão. Tente algo mais obscuro!");

export default function App() {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [sel, setSel] = useState(0);
  const [res, setRes] = useState([]);
  const [fx, setFx] = useState(null);
  const [shake, setShake] = useState(false);
  const [sparks, setSparks] = useState([]);
  const [started, setStarted] = useState(false);
  const inp = useRef();
  const idx = useMemo(() => QUESTIONS.map(buildIndex), []);
  const done = res.length === QUESTIONS.length;
  const total = res.reduce((s, r) => s + r.pts, 0);
  const alt = Math.min(100, total / 6.6);
  const sugg = useMemo(() => (done ? [] : suggest(idx[i], text)), [text, i, done]);
  useEffect(() => { setSel(0); }, [text]);
  useEffect(() => { inp.current?.focus(); }, [i, started]);

  const onType = (v) => {
    setText(v);
    const id = Math.random();
    setSparks((s) => [...s.slice(-8), { id, x: 6 + Math.min(v.length, 28) * 3, c: Math.random() * 360 }]);
    setTimeout(() => setSparks((s) => s.filter((p) => p.id !== id)), 700);
  };

  const submit = (entry) => {
    const exact = idx[i].find((e) => e.key === norm(text));
    const pick = entry || exact || sugg[sel];
    if (!pick) { setShake(true); setTimeout(() => setShake(false), 450); return; }
    setRes((r) => [...r, { ...pick, q: QUESTIONS[i].q }]);
    setFx({ ...pick, id: Math.random() });
    setText("");
    setTimeout(() => setFx(null), 2200);
    setTimeout(() => setI((n) => Math.min(n + 1, QUESTIONS.length - 1)), 900);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, sugg.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter") submit();
  };

  const share = () => {
    const bar = res.map((r) => (r.pts >= 100 ? "🚀" : r.pts >= 75 ? "🛰️" : r.pts >= 50 ? "☁️" : r.pts >= 25 ? "🐦" : "🌱")).join("");
    navigator.clipboard?.writeText(`Camarilhão 🎈 ${total}/700\n${bar}`);
    alert("Resultado copiado!");
  };

  const worldPct = alt * 0.9; // quanto o mundo desliza
  return (
    <div className="app">
      <h1 className="logo">CAMARILHÃO</h1>
      <div className="frame">
        <div className="world" style={{ transform: `translateY(${worldPct}%)` }}>
          {STARS.map((s) => <i key={s.id} className="star" style={{ left: s.x + "%", bottom: s.y + "%", width: s.s, height: s.s, animationDelay: s.d + "s" }} />)}
          {CLOUDS.map((c, k) => <span key={k} className="cloud" style={{ bottom: c + "%", left: ((k * 29) % 80) + "%" }}>☁️</span>)}
          <span className="obj" style={{ bottom: "26%", left: "70%" }}>🐦</span>
          <span className="obj" style={{ bottom: "37%", left: "12%" }}>✈️</span>
          <span className="obj" style={{ bottom: "62%", left: "74%" }}>☄️</span>
          <span className="obj" style={{ bottom: "72%", left: "18%" }}>🛰️</span>
          <span className="obj big" style={{ bottom: "84%", left: "70%" }}>🌙</span>
          <span className="obj big" style={{ bottom: "93%", left: "14%" }}>🪐</span>
          <span className="obj" style={{ bottom: "98%", left: "55%" }}>👽</span>
          <div className="ground">🏙️ 🌴 🏠 🌳 ⛪ 🌴 🏘️</div>
        </div>
        <div className="balloon"><span className="bal">🎈</span><span className="shrimp">🦐</span></div>
        <div className="hud"><b>{total}</b> pts · {Math.round(alt * 100)} m</div>
        {fx && (
          <div key={fx.id} className={"pop " + (fx.pts === 100 ? "gold" : "")}>
            {fx.pts === 100 && <div className="krill">1 EM 1 CAMARILHÃO!</div>}
            <div className="pts">+{fx.pts}</div>
            <div>{fx.name} · {tier(fx.pts)}</div>
          </div>
        )}
        {fx?.pts === 100 && Array.from({ length: 24 }, (_, k) => <i key={k} className="conf" style={{ left: (k * 4.3) % 100 + "%", background: `hsl(${k * 40} 90% 60%)`, animationDelay: (k % 6) * 0.08 + "s" }} />)}
      </div>

      {!started ? (
        <div className="panel center">
          <p>7 perguntas. Várias respostas certas.<br />Quanto mais obscura a resposta, mais alto o balão sobe — até o espaço.</p>
          <button className="btn" onClick={() => setStarted(true)}>Decolar 🎈</button>
        </div>
      ) : done ? (
        <div className="panel center">
          <div className="big-score">{total}<small>/700</small></div>
          <p>{verdict(total)}</p>
          <ul className="recap">{res.map((r, k) => <li key={k}><span>{r.q.replace("Cite ", "")}</span><b>{r.name}</b><em>{r.pts}</em></li>)}</ul>
          <button className="btn" onClick={share}>Compartilhar</button>{" "}
          <button className="btn ghost" onClick={() => { setRes([]); setI(0); }}>Jogar de novo</button>
        </div>
      ) : (
        <div className="panel">
          <div className="qn">Pergunta {i + 1} de {QUESTIONS.length}</div>
          <h2>{QUESTIONS[i].q}</h2>
          <div className={"box " + (shake ? "shake" : "")}>
            <input ref={inp} value={text} onChange={(e) => onType(e.target.value)} onKeyDown={onKey} placeholder="Digite sua resposta…" autoComplete="off" spellCheck="false" />
            {sparks.map((s) => <i key={s.id} className="spark" style={{ left: s.x + "%", background: `hsl(${s.c} 95% 65%)` }} />)}
            <button className="go" onClick={() => submit()}>↑</button>
            {sugg.length > 0 && (
              <ul className="sug">
                {sugg.map((s, k) => <li key={s.name} className={k === sel ? "on" : ""} onMouseEnter={() => setSel(k)} onClick={() => submit(s)}>{s.name}</li>)}
              </ul>
            )}
          </div>
          {shake && <p className="err">Não reconhecemos essa resposta. Escolha uma sugestão ou tente outra.</p>}
        </div>
      )}
    </div>
  );
}
