/* origem.js — rastreio de origem do lead + consentimento (LGPD). Implementação própria VIZIO, sem dependências.
   - Captura utm_*, gclid/fbclid/ttclid, página de entrada e referência.
   - Persiste 90 dias SÓ com consentimento ("Aceitar"); sem ele, vale apenas a sessão.
   - VZOrigem.link(url) repassa a origem no próprio link (não depende de storage entre abas).
   - Eventos no dataLayer ficam no navegador (preparação para pixels futuros, que só entram após consentimento). */
(function (w, d) {
  "use strict";
  var KEY = "vz_origem", CKEY = "vz_consent", DIAS = 90;
  var CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid"];

  function consent() { try { return localStorage.getItem(CKEY); } catch (_) { return null; } }
  function ler() {
    var raw = null;
    try { if (consent() === "sim") raw = localStorage.getItem(KEY); } catch (_) {}
    try { if (!raw) raw = sessionStorage.getItem(KEY); } catch (_) {}
    if (!raw) return null;
    try { var o = JSON.parse(raw); if (o && o.exp && Date.now() > o.exp) return null; return o; } catch (_) { return null; }
  }
  function gravar(o) {
    var s = JSON.stringify(o);
    try { sessionStorage.setItem(KEY, s); } catch (_) {}
    if (consent() === "sim") { try { localStorage.setItem(KEY, s); } catch (_) {} }
  }
  function curto(v, n) { return String(v == null ? "" : v).slice(0, n); }

  // ---- captura ----
  var p; try { p = new URLSearchParams(w.location.search); } catch (_) { p = { get: function () { return null; } }; }
  var novo = {};
  CAMPOS.forEach(function (k) { var v = p.get(k); if (v) novo[k] = curto(v, 200); });
  var lp = p.get("lp"), rf = p.get("rf");               // vindos de VZOrigem.link()
  var temNovo = Object.keys(novo).length > 0 || !!lp || !!rf;
  var atual = ler();
  if (temNovo || !atual) {
    var ref = d.referrer || "";
    try { if (ref && new URL(ref).host === w.location.host) ref = ""; } catch (_) { ref = ""; }
    var o = {};
    CAMPOS.forEach(function (k) { if (novo[k]) o[k] = novo[k]; });
    o.landing_path = curto(lp || w.location.pathname, 200);
    var r = rf || ref; if (r) o.referrer = curto(r, 300);
    o.ts = Date.now(); o.exp = Date.now() + DIAS * 864e5;
    gravar(o); atual = o;
  }

  w.VZOrigem = {
    get: function () {
      var o = ler() || {}, r = {};
      CAMPOS.concat(["landing_path", "referrer"]).forEach(function (k) { if (o[k]) r[k] = o[k]; });
      r.consentimento = consent() === "sim" ? "sim" : "nao";
      return r;
    },
    link: function (url) {
      try {
        var u = new URL(url, w.location.href), o = ler() || {};
        CAMPOS.forEach(function (k) { if (o[k] && !u.searchParams.get(k)) u.searchParams.set(k, o[k]); });
        if (o.landing_path && !u.searchParams.get("lp")) u.searchParams.set("lp", o.landing_path);
        if (o.referrer && !u.searchParams.get("rf")) u.searchParams.set("rf", o.referrer);
        return u.toString();
      } catch (_) { return url; }
    },
    consentir: function (sim) {
      try { localStorage.setItem(CKEY, sim ? "sim" : "nao"); } catch (_) {}
      if (sim) { var o = ler(); if (o) gravar(o); }
      else { try { localStorage.removeItem(KEY); } catch (_) {} }
      try { (w.dataLayer = w.dataLayer || []).push({ event: "vz_consentimento", valor: sim ? "sim" : "nao" }); } catch (_) {}
    },
    consent: consent
  };

  try { (w.dataLayer = w.dataLayer || []).push({ event: "vz_pagina", origem: w.VZOrigem.get() }); } catch (_) {}

  // Repassa a origem em qualquer link para o cadastro (inclusive links criados depois, como o do simulador).
  d.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="cadastro.html"]') : null;
    if (a) a.href = w.VZOrigem.link(a.href);
  }, true);

  // ---- banner de consentimento ----
  function banner() {
    if (consent()) return;
    var css = ""
      + ".vzcb{position:fixed;left:16px;bottom:16px;z-index:9990;max-width:520px;background:var(--surface,#1A1A1E);"
      + "color:var(--text,#E9E4DA);border:1px solid var(--border,#34343B);border-radius:16px;padding:16px 18px;"
      + "box-shadow:0 18px 50px rgba(0,0,0,.5);font:inherit;font-size:.88rem;line-height:1.5;opacity:0;transform:translateY(10px);"
      + "transition:opacity .3s,transform .3s}"
      + ".vzcb.on{opacity:1;transform:none}"
      + ".vzcb a{color:var(--gold-l,#E6D08A)}"
      + ".vzcb .r{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}"
      + ".vzcb button{font:inherit;font-weight:600;font-size:.86rem;border-radius:10px;padding:9px 14px;cursor:pointer;border:1px solid var(--border,#34343B)}"
      + ".vzcb .ok{background:var(--gold,#C9A85C);color:#0A0A0B;border-color:var(--gold,#C9A85C)}"
      + ".vzcb .no{background:transparent;color:var(--text,#E9E4DA)}"
      + ".vzcb button:focus-visible{outline:2px solid var(--gold,#C9A85C);outline-offset:2px}"
      + "@media (max-width:600px){.vzcb{left:10px;right:10px;bottom:10px;max-width:none}"
      + "body.vzcb-aberto .wa-float{transform:translateY(-150px)}}";
    var st = d.createElement("style"); st.textContent = css; d.head.appendChild(st);
    var box = d.createElement("div");
    box.className = "vzcb"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Privacidade");
    box.innerHTML = "Usamos dados de navegação para saber por onde você chegou até nós e melhorar nosso atendimento. "
      + "Saiba mais na <a href=\"privacidade.html\" target=\"_blank\" rel=\"noopener\">política de privacidade</a>."
      + "<div class=\"r\"><button type=\"button\" class=\"ok\">Aceitar</button><button type=\"button\" class=\"no\">Só o essencial</button></div>";
    function fechar(sim) {
      w.VZOrigem.consentir(sim);
      box.classList.remove("on"); d.body.classList.remove("vzcb-aberto");
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 320);
    }
    box.querySelector(".ok").addEventListener("click", function () { fechar(true); });
    box.querySelector(".no").addEventListener("click", function () { fechar(false); });
    d.body.appendChild(box); d.body.classList.add("vzcb-aberto");
    requestAnimationFrame(function () { box.classList.add("on"); });
    setTimeout(function () { box.classList.add("on"); }, 60);
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", banner); else banner();
})(window, document);
