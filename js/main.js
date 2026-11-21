// 株式会社ピクセル・フォージ（架空）— 全ページ共通のスクリプト
// 1. スマホのメニュー開閉
// 2. 開発タイトルの絞り込み（games.html）
// 3. お問い合わせの 入力 → 確認 → 完了（contact.html）。授業課題用のため、どこにも送信しない。
(function () {
  "use strict";

  // ---- 1. メニュー ----
  var menuBtn = document.querySelector(".menu-btn");
  var gnav = document.getElementById("gnav");
  if (menuBtn && gnav) {
    var setMenu = function (open) {
      gnav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "CLOSE" : "MENU";
    };
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    gnav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && gnav.classList.contains("is-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  // ---- 2. タイトルの絞り込み ----
  var filter = document.getElementById("game-filter");
  if (filter) {
    var games = Array.prototype.slice.call(document.querySelectorAll(".game"));
    var countEl = document.getElementById("game-count");
    var emptyEl = document.getElementById("game-empty");
    var state = { kind: "all", pf: "all" };

    var match = function (g, kind, pf) {
      return (kind === "all" || g.dataset.kind === kind) &&
        (pf === "all" || g.dataset.pf.split(" ").indexOf(pf) !== -1);
    };
    var chips = Array.prototype.slice.call(filter.querySelectorAll(".chip"));

    var apply = function () {
      var shown = 0;
      games.forEach(function (g) {
        g.hidden = !match(g, state.kind, state.pf);
        if (!g.hidden) shown++;
      });
      countEl.textContent = shown;
      emptyEl.hidden = shown !== 0;
      // 各ボタンに「押したら何件になるか」を出す
      chips.forEach(function (c) {
        var kind = c.dataset.kind || state.kind;
        var pf = c.dataset.pf || state.pf;
        var n = games.filter(function (g) { return match(g, kind, pf); }).length;
        var span = c.querySelector(".n") || c.appendChild(document.createElement("span"));
        span.className = "n";
        span.textContent = n;
        c.setAttribute("aria-pressed", String(c.dataset.kind ? c.dataset.kind === state.kind : c.dataset.pf === state.pf));
      });
      // 条件を URL に残す（共有・戻るで同じ一覧に戻れる）
      var q = new URLSearchParams();
      if (state.kind !== "all") q.set("kind", state.kind);
      if (state.pf !== "all") q.set("pf", state.pf);
      var qs = q.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
    };

    filter.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      var key = btn.dataset.kind ? "kind" : "pf";
      state[key] = btn.dataset[key];
      apply();
    });

    var initial = new URLSearchParams(location.search);
    chips.forEach(function (c) {
      if (c.dataset.kind && c.dataset.kind === initial.get("kind")) state.kind = c.dataset.kind;
      if (c.dataset.pf && c.dataset.pf === initial.get("pf")) state.pf = c.dataset.pf;
    });
    apply();
    // スクリプトが無いときは全件をそのまま読めるように、絞り込みの欄はスクリプトで出す
    filter.hidden = false;
  }

  // ---- 3. お問い合わせ ----
  var form = document.getElementById("contact-form");
  if (form) {
    var confirmBox = document.getElementById("contact-confirm");
    var doneBox = document.getElementById("contact-done");
    var list = document.getElementById("confirm-list");
    var steps = document.querySelectorAll("#step-bar li");
    var typeSel = document.getElementById("f-type");
    var titleField = document.getElementById("title-field");

    var showStep = function (n) {
      form.hidden = n !== 0;
      confirmBox.hidden = n !== 1;
      doneBox.hidden = n !== 2;
      steps.forEach(function (li, i) {
        if (i === n) li.setAttribute("aria-current", "step");
        else li.removeAttribute("aria-current");
      });
      var target = [form, confirmBox, doneBox][n];
      document.getElementById("step-bar").scrollIntoView({ block: "start" });
      if (n > 0) target.focus();
    };

    // 採用ページの「採用応募フォームへ」から来たら、種別を採用にしておく
    var params = new URLSearchParams(location.search);
    if (params.get("type") && typeSel.querySelector('option[value="' + params.get("type") + '"]')) {
      typeSel.value = params.get("type");
    }
    // 対象タイトルは、ゲームの問い合わせ（または未選択）のときだけ出す
    var syncTitle = function () {
      titleField.hidden = !(typeSel.value === "" || typeSel.value === "game" || typeSel.value === "press");
    };
    typeSel.addEventListener("change", syncTitle);
    syncTitle();

    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    var checks = [
      { el: "f-type", ok: function (el) { return el.value !== ""; } },
      { el: "f-name", ok: function (el) { return el.value.trim() !== ""; } },
      { el: "f-email", ok: function (el) { return emailOk(el.value.trim()); } },
      { el: "f-body", ok: function (el) { return el.value.trim() !== ""; } },
      { el: "f-agree", ok: function (el) { return el.checked; } }
    ];

    var validate = function () {
      var firstBad = null;
      checks.forEach(function (c) {
        var el = document.getElementById(c.el);
        var field = el.closest(".field");
        var bad = !c.ok(el);
        field.classList.toggle("is-invalid", bad);
        field.querySelector(".err").hidden = !bad;
        el.setAttribute("aria-invalid", String(bad));
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    };

    var rows = [
      ["お問い合わせ種別", function () { return typeSel.options[typeSel.selectedIndex].text; }],
      ["対象タイトル", function () {
        if (titleField.hidden) return "—";
        var s = document.getElementById("f-title");
        return s.options[s.selectedIndex].text;
      }],
      ["お名前", function () { return document.getElementById("f-name").value.trim(); }],
      ["フリガナ", function () { return document.getElementById("f-kana").value.trim() || "—"; }],
      ["貴社名・媒体名", function () { return document.getElementById("f-org").value.trim() || "—"; }],
      ["メールアドレス", function () { return document.getElementById("f-email").value.trim(); }],
      ["お問い合わせ内容", function () { return document.getElementById("f-body").value.trim(); }]
    ];

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      list.textContent = "";
      rows.forEach(function (r) {
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = r[0];
        dd.textContent = r[1](); // textContent なので入力値が HTML として解釈されることはない
        list.appendChild(dt);
        list.appendChild(dd);
      });
      showStep(1);
    });
    document.getElementById("btn-back").addEventListener("click", function () { showStep(0); });
    document.getElementById("btn-send").addEventListener("click", function () {
      // 授業課題用のデモ：送信はせず、入力を消して完了画面へ
      form.reset();
      syncTitle();
      showStep(2);
    });
  }
})();
