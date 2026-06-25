#!/usr/bin/env python3
"""
build.py — קורא את קטגוריות_ומוצרים.xlsx ומייצר index.html מעודכן
הרץ: python build.py
"""
import json, re, sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("מתקין openpyxl...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "openpyxl", "-q"])
    import openpyxl

XLSX_FILE = "קטגוריות_ומוצרים.xlsx"
HTML_FILE = "index.html"

def read_categories():
    wb = openpyxl.load_workbook(XLSX_FILE)
    ws = wb.active
    cat_map = {}
    cat_order = []
    last_cat = None
    for row in ws.iter_rows(min_row=4, values_only=True):
        cat  = str(row[0] or "").strip() if row[0] else None
        prod = str(row[1] or "").strip() if len(row) > 1 and row[1] else ""
        if not cat and not prod:
            continue
        # carry forward merged/empty category cell
        if cat:
            last_cat = cat
        else:
            cat = last_cat
        if not cat:
            continue
        if cat not in cat_map:
            cat_map[cat] = []
            cat_order.append(cat)
        if prod:
            cat_map[cat].append(prod)
    return cat_order, cat_map

def build_cats_js(cat_order, cat_map):
    lines = ["const DEF_CATS = ["]
    for i, label in enumerate(cat_order):
        products = cat_map[label]
        prods_js = json.dumps(products, ensure_ascii=False)
        comma = "," if i < len(cat_order) - 1 else ""
        lines.append(f'  {{id:"cat_{i}",label:{json.dumps(label, ensure_ascii=False)},products:{prods_js}}}{comma}')
    lines.append("];")
    return "\n".join(lines)

def main():
    if not Path(XLSX_FILE).exists():
        print(f"❌ לא נמצא קובץ: {XLSX_FILE}")
        sys.exit(1)
    if not Path(HTML_FILE).exists():
        print(f"❌ לא נמצא קובץ: {HTML_FILE}")
        sys.exit(1)

    cat_order, cat_map = read_categories()
    total_prods = sum(len(v) for v in cat_map.values())
    print(f"✓ נקראו {len(cat_order)} קטגוריות, {total_prods} מוצרים")

    new_cats_js = build_cats_js(cat_order, cat_map)

    with open(HTML_FILE, "r", encoding="utf-8") as f:
        html = f.read()

    pattern = r"const DEF_CATS = \[[\s\S]*?\];"
    if not re.search(pattern, html):
        print("❌ לא נמצא DEF_CATS ב-index.html")
        sys.exit(1)

    html = re.sub(pattern, new_cats_js, html, count=1)

    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✓ index.html עודכן בהצלחה!")
    for label in cat_order:
        print(f"   {label} ({len(cat_map[label])} מוצרים): {', '.join(cat_map[label])}")

if __name__ == "__main__":
    main()
