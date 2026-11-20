from pathlib import Path
import importlib.util,json
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("validator",ROOT/"skills/olah-style-vllm-posts/scripts/validate.py");v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
def test_all_articles_validate():
 paths=sorted((ROOT/"posts").glob("*/*/index.html"));assert len(paths)==28
 failures=[v.validate(p) for p in paths if not v.validate(p)["pass"]];assert not failures,failures
def test_evidence_and_diagram_exist():
 for p in (ROOT/"posts").glob("*/*/index.html"):
  assert (p.parent/"evidence.json").is_file();assert (p.parent/"assets/figure-01.svg").is_file()
  d=json.loads((p.parent/"evidence.json").read_text());assert d["sources"] and d["claims"]
