#!/usr/bin/env python3
from pathlib import Path
import argparse,json,sys
ROOT=Path(__file__).resolve().parents[1];SRC=ROOT/"courses.json";OUT=ROOT/"courses-data.js"
def build():
 d=json.loads(SRC.read_text(encoding="utf-8"))
 if len(d["chapters"])!=d["chapterCount"]:raise ValueError("chapter count mismatch")
 seen=set()
 for c in d["chapters"]:
  if c["file"] in seen:raise ValueError("duplicate path")
  seen.add(c["file"])
  if not (ROOT/c["file"]).is_file():raise ValueError("missing article "+c["file"])
  if not (ROOT/c["legacyFile"]).is_file():raise ValueError("missing redirect "+c["legacyFile"])
 return "/* Generated from courses.json. */\nwindow.VLLM_COURSES = "+json.dumps(d,ensure_ascii=False,indent=2)+";\n"
def main():
 p=argparse.ArgumentParser();p.add_argument("--check",action="store_true");a=p.parse_args();v=build()
 if a.check:
  if not OUT.exists() or OUT.read_text(encoding="utf-8")!=v:print("courses-data.js stale",file=sys.stderr);return 1
  print("catalog projection synchronized")
 else:OUT.write_text(v,encoding="utf-8")
 return 0
if __name__=="__main__":raise SystemExit(main())
