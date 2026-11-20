#!/usr/bin/env python3
from pathlib import Path
import argparse,json,re,sys
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[3]
def validate(p):
 s=BeautifulSoup(p.read_text(encoding="utf-8"),"html.parser");bad=[]
 if len(s.find_all("h1"))!=1:bad.append("expected one h1")
 if not s.find("main") or not s.find("nav"):bad.append("missing main/nav")
 if not s.find("meta",attrs={"name":"viewport"}):bad.append("missing viewport")
 if len(s.find_all("h2"))<2:bad.append("expected at least two h2")
 if not s.find("figure"):bad.append("missing figure")
 ids={x.get("id") for x in s.select("[id]")}
 for a in s.select('a[href^="#"]'):
  if a["href"][1:] not in ids:bad.append("broken anchor "+a["href"])
 for f in s.find_all("figure"):
  if not f.find(["svg","img"]) or not f.find("figcaption"):bad.append("figure requires image and caption")
 for im in s.find_all("img"):
  if not im.get("alt"):bad.append("image missing alt")
  src=im.get("src","")
  if src and not src.startswith("http") and not (p.parent/src).exists():bad.append("missing image "+src)
 for link in s.find_all("link",href=True):
  if not link["href"].startswith("http") and not (p.parent/link["href"]).exists():bad.append("missing css "+link["href"])
 for sc in s.find_all("script",src=True):
  if not sc["src"].startswith("http") and not (p.parent/sc["src"]).exists():bad.append("missing js "+sc["src"])
 e=p.parent/"evidence.json"
 try:
  d=json.loads(e.read_text(encoding="utf-8"))
  if not isinstance(d.get("sources"),list) or not isinstance(d.get("claims"),list):bad.append("evidence requires sources and claims arrays")
 except Exception as ex:bad.append("invalid evidence: "+str(ex))
 return {"path":str(p.relative_to(ROOT)),"pass":not bad,"errors":bad}
def main():
 a=argparse.ArgumentParser();a.add_argument("html",nargs="?");a.add_argument("--all",action="store_true");x=a.parse_args()
 fs=sorted((ROOT/"posts").glob("*/*/index.html")) if x.all else [Path(x.html).resolve()]
 reports=[validate(p) for p in fs];print(json.dumps({"pass":all(r["pass"] for r in reports),"articles":reports},ensure_ascii=False,indent=2));return 0 if all(r["pass"] for r in reports) else 1
if __name__=="__main__":raise SystemExit(main())
