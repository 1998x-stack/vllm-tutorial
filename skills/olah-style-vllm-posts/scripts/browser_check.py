#!/usr/bin/env python3
from pathlib import Path
import argparse,json
from playwright.sync_api import sync_playwright
def main():
 p=argparse.ArgumentParser();p.add_argument("html",type=Path);p.add_argument("--output",type=Path,required=True);a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True);result={"pass":True,"viewports":{}}
 with sync_playwright() as pw:
  b=pw.chromium.launch(headless=True,args=["--no-sandbox"])
  for name,w,h in [("desktop",1440,900),("tablet",768,1024),("mobile",390,844),("narrow",360,800)]:
   page=b.new_page(viewport={"width":w,"height":h});errs=[];page.on("pageerror",lambda e:errs.append(str(e)));page.goto(a.html.resolve().as_uri(),wait_until="load")
   m=page.evaluate("()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,h1:document.querySelectorAll('h1').length,broken:[...document.images].filter(x=>!x.complete||!x.naturalWidth).length})")
   ok=m["width"]<=m["viewport"]+1 and m["h1"]==1 and m["broken"]==0 and not errs;result["viewports"][name]={**m,"errors":errs,"pass":ok};result["pass"] &= ok;page.screenshot(path=str(a.output/f"{name}.png"),full_page=True)
   if name=="desktop":
    demo=page.locator("[data-demo]")
    if demo.count():
     before=demo.locator("[data-output]").inner_text();demo.locator("[data-step]").click();after=demo.locator("[data-output]").inner_text();result["interaction"]={"pass":before!=after};result["pass"] &= before!=after
   page.close()
  b.close()
 (a.output/"report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8");print(json.dumps(result,ensure_ascii=False,indent=2));return 0 if result["pass"] else 1
if __name__=="__main__":raise SystemExit(main())
