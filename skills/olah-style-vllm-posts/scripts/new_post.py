#!/usr/bin/env python3
from pathlib import Path
import argparse,json,re
ROOT=Path(__file__).resolve().parents[3]
def main():
 p=argparse.ArgumentParser();p.add_argument("--category",required=True);p.add_argument("--number",required=True);p.add_argument("--slug",required=True);p.add_argument("--title",required=True);p.add_argument("--dek",default="从一个具体问题开始，逐步解释 vLLM 的机制、实现和工程边界。");a=p.parse_args()
 if not re.fullmatch(r"\d{2}",a.number) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*",a.slug):p.error("invalid number or slug")
 dest=ROOT/"posts"/a.category/f"{a.number}-{a.slug}";dest.mkdir(parents=True,exist_ok=False);(dest/"assets").mkdir()
 tpl=(Path(__file__).resolve().parents[1]/"assets/templates/article.html").read_text(encoding="utf-8")
 tpl=tpl.replace("{{TITLE}}",a.title).replace("{{NUMBER}}",a.number).replace("{{CATEGORY}}",a.category).replace("{{DEK}}",a.dek)
 (dest/"index.html").write_text(tpl,encoding="utf-8");(dest/"evidence.json").write_text(json.dumps({"schema_version":1,"article":a.slug,"sources":[],"claims":[]},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print(dest)
if __name__=="__main__":main()
