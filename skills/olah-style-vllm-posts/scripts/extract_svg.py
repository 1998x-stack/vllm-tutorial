#!/usr/bin/env python3
from pathlib import Path
from bs4 import BeautifulSoup
from xml.etree import ElementTree as ET
import argparse,re,json
def main():
 p=argparse.ArgumentParser();p.add_argument("html",type=Path);p.add_argument("--out",type=Path,required=True);a=p.parse_args();s=BeautifulSoup(a.html.read_text(encoding="utf-8"),"html.parser");a.out.mkdir(parents=True,exist_ok=True);manifest=[]
 for i,svg in enumerate(s.find_all("svg"),1):
  name=re.sub(r"[^A-Za-z0-9_.-]","-",svg.get("data-export",f"figure-{i:02d}.svg"));raw=str(svg)
  if "xmlns=" not in raw:raw=raw.replace("<svg","<svg xmlns=\"http://www.w3.org/2000/svg\"",1)
  ET.fromstring(raw);(a.out/name).write_text('<?xml version="1.0" encoding="UTF-8"?>\n'+raw+"\n",encoding="utf-8");manifest.append(name)
 (a.out/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
if __name__=="__main__":main()
