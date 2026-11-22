"""Unit tests for the minimal offline RAG teaching baseline."""
import unittest
from pathlib import Path
from examples import rag_demo


class RAGDemoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.corpus = rag_demo.load_corpus()

    def test_corpus_has_unique_ids_and_scopes(self):
        self.assertGreaterEqual(len(self.corpus), 6)
        self.assertEqual(len({d["id"] for d in self.corpus}), len(self.corpus))

    def test_retrieval_matches_paged_attention(self):
        docs = rag_demo.retrieve("PagedAttention Block Table", self.corpus, top_k=3)
        ids = [row["doc"]["id"] for row in docs]
        self.assertIn("paged-attention", ids)
        self.assertGreater(docs[0]["score"], 0)

    def test_prefix_cache_retrieval(self):
        docs = rag_demo.retrieve("Prefix Cache KV blocks", self.corpus, top_k=3)
        ids = [row["doc"]["id"] for row in docs]
        self.assertIn("prefix-cache", ids)

    def test_acl_hides_team_documents_from_public(self):
        public = rag_demo.retrieve("Team 容量", self.corpus, scope="public", top_k=10)
        self.assertTrue(all(row["doc"]["scope"] == "public" for row in public))
        team = rag_demo.retrieve("Team 容量", self.corpus, scope="team", top_k=10)
        self.assertIn("team-budget", [row["doc"]["id"] for row in team])

    def test_unknown_scope_fails_closed(self):
        with self.assertRaises(ValueError):
            rag_demo.retrieve("anything", self.corpus, scope="admin")

    def test_context_uses_source_ids_and_budget(self):
        docs = rag_demo.retrieve("Prefix Cache", self.corpus, top_k=3)
        messages = rag_demo.build_messages("What is Prefix Cache?", docs, max_chars=120)
        self.assertEqual(messages[0]["role"], "system")
        self.assertIn("Question: What is Prefix Cache?", messages[1]["content"])
        self.assertIn("[prefix-cache]", messages[1]["content"])

    def test_invalid_questions_fail(self):
        with self.assertRaises(ValueError):
            rag_demo.build_messages("", [])
        with self.assertRaises(ValueError):
            rag_demo.build_messages("q" * 501, [])

    def test_loopback_only_and_no_redirect(self):
        self.assertEqual(rag_demo.validate_loopback_url("http://127.0.0.1:8000"), "http://127.0.0.1:8000")
        for uri in ("https://example.com:443", "http://evil.com:8000",
                    "http://localhost:8000/path", "http://localhost:8000?redirect=evil",
                    "http://user:password@localhost:8000", "http://localhost"):
            with self.subTest(uri=uri), self.assertRaises(ValueError):
                rag_demo.validate_loopback_url(uri)

    def test_offline_cli_makes_no_model_call(self):
        from contextlib import redirect_stdout
        import io
        buf = io.StringIO()
        with redirect_stdout(buf):
            status = rag_demo.main(["--query", "PagedAttention"])
        self.assertEqual(status, 0)
        self.assertIn("NO MODEL CALLED", buf.getvalue())


if __name__ == "__main__":
    unittest.main()
