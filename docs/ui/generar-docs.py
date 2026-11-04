# Copia los docs reales del proyecto a vista-docs-datos.js para el prototipo de Mapa y Docs (W-7, W-8).
# Se vuelve a correr cuando cambian los docs: python docs/ui/generar-docs.py
import json, pathlib

aca = pathlib.Path(__file__).parent
docs = {p.name: p.read_text(encoding="utf-8") for p in sorted(aca.parent.glob("*.md"))}
(aca / "vista-docs-datos.js").write_text("// Generado por generar-docs.py: copia de docs/*.md\nconst DOCS = " + json.dumps(docs, ensure_ascii=False) + ";\n", encoding="utf-8")
print(len(docs), "documentos")
