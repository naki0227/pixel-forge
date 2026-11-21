#!/usr/bin/env python3
"""src/ のページに共通のヘッダー・フッターを差し込み、公開用の HTML をリポジトリ直下に書き出す。

使い方: python3 tools/build.py
- src/_header.html と src/_footer.html が全ページ共通（メニューを直すならここだけ）。
- src/<page>.html の先頭の --- で囲んだ部分に title / description / current を書く。
- current のページのメニューに aria-current="page" を付ける。
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
header = (SRC / "_header.html").read_text(encoding="utf-8")
footer = (SRC / "_footer.html").read_text(encoding="utf-8")

for page in sorted(SRC.glob("[!_]*.html")):
    text = page.read_text(encoding="utf-8")
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not m:
        raise SystemExit(f"{page.name}: 先頭の --- が見つかりません")
    meta = dict(line.split(": ", 1) for line in m.group(1).splitlines())
    body = text[m.end():]
    head = header.replace("{{title}}", meta["title"]).replace("{{description}}", meta["description"])
    if meta["current"] != "index.html":
        head = head.replace(f'<a href="./{meta["current"]}">', f'<a href="./{meta["current"]}" aria-current="page">', 1)
    (ROOT / page.name).write_text(head + body + footer, encoding="utf-8")
    print("built", page.name)
