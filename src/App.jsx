import { useState } from 'react'
import styles from './App.module.css'
import { WHATSAPP_NUMBER, DEFAULT_CATEGORIES } from './data.js'

// ── utils ──
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

function deepClone(cats) {
  return cats.map(c => ({
    ...c,
    products: [...c.products],
    ...(c.flavors ? { flavors: [...c.flavors], types: [...c.types] } : {}),
  }))
}

// ── Top Bar ──
function TopBar({ title, subtitle, right }) {
  return (
    <div className={styles.topbar}>
      <div>
        <div className={styles.tbTitle}>{title}</div>
        {subtitle && <div className={styles.tbSub}>{subtitle}</div>}
      </div>
      <div className={styles.tbRight}>{right}</div>
    </div>
  )
}

function IconBtn({ children, onClick, badge }) {
  return (
    <button className={styles.iconBtn} onClick={onClick}>
      {children}
      {badge ? <span className={styles.badge}>{badge}</span> : null}
    </button>
  )
}

// ── Toast ──
let toastTimer = null
function useToast() {
  const [toast, setToast] = useState(null)
  function show(msg, err) {
    clearTimeout(toastTimer)
    setToast({ msg, err })
    toastTimer = setTimeout(() => setToast(null), 2200)
  }
  return [toast, show]
}

// ── Hookah Modal ──
function HookahModal({ cat, onAdd, onClose }) {
  const [flavor, setFlavor] = useState(null)
  const [type, setType] = useState(null)
  const canAdd = flavor && type
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTitle}>בחירת נרגילה</div>
        <div className={styles.modalSec}>
          <div className={styles.modalLbl}>טעם</div>
          <div className={styles.chips}>
            {cat.flavors.map(f => (
              <button key={f} className={`${styles.chip} ${flavor === f ? styles.chipOn : ''}`} onClick={() => setFlavor(f)}>{f}</button>
            ))}
          </div>
        </div>
        <div className={styles.modalSec}>
          <div className={styles.modalLbl}>סוג</div>
          <div className={styles.chips}>
            {cat.types.map(t => (
              <button key={t} className={`${styles.chip} ${type === t ? styles.chipOn : ''}`} onClick={() => setType(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className={styles.modalRow}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ opacity: canAdd ? 1 : 0.4 }}
            onClick={() => { if (!canAdd) return; onAdd(`נרגילה — ${flavor} — ${type}`); onClose() }}>
            הוסף להזמנה
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>ביטול</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════════

// ── 1. Tables ──
function TablesScreen({ totalTables, onSelect, onSettings }) {
  return (
    <div className={styles.screen}>
      <TopBar title="בחירת שולחן" subtitle="לחץ על שולחן להתחלת הזמנה"
        right={<IconBtn onClick={onSettings}>⚙️</IconBtn>} />
      <div className={styles.content}>
        <div className={styles.grid5}>
          {Array.from({ length: totalTables }, (_, i) => i + 1).map(n => (
            <button key={n} className={styles.tableBtn} onClick={() => onSelect(n)}>
              <div className={styles.tableLbl}>שולחן</div>
              <div className={styles.tableNum}>{n}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 2. Menu ──
function MenuScreen({ tableNum, categories, itemCount, onCategory, onSummary, onBack }) {
  return (
    <div className={styles.screen}>
      <TopBar title={`שולחן ${tableNum}`} subtitle="בחר קטגוריה"
        right={<>
          <IconBtn onClick={onSummary} badge={itemCount || null}>🧾</IconBtn>
          <IconBtn onClick={onBack}>🏠</IconBtn>
        </>} />
      <div className={styles.content}>
        <div className={styles.grid2}>
          {categories.map(cat => (
            <button key={cat.id} className={styles.catBtn} onClick={() => onCategory(cat.id)}>
              <span className={styles.catLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
        <hr className={styles.divider} />
        <div className={styles.row}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSummary}>
            {itemCount > 0 && <span className={styles.bdg}>{itemCount}</span>} סיכום הזמנה
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onBack}>← שולחנות</button>
        </div>
      </div>
    </div>
  )
}

// ── 3. Category products ──
function CategoryScreen({ tableNum, cat, itemCount, onAdd, onSummary, onMenu, onBack }) {
  const [hookahOpen, setHookahOpen] = useState(false)
  return (
    <div className={styles.screen}>
      <TopBar title={`שולחן ${tableNum} — ${cat.label}`} subtitle="לחץ על מוצר להוספה"
        right={<>
          <IconBtn onClick={onSummary} badge={itemCount || null}>🧾</IconBtn>
          <IconBtn onClick={onMenu}>←</IconBtn>
        </>} />
      {hookahOpen && <HookahModal cat={cat} onAdd={onAdd} onClose={() => setHookahOpen(false)} />}
      <div className={styles.content}>
        {cat.products.length === 0
          ? <div className={styles.empty}><div className={styles.emptyIcon}>📋</div><div>אין מוצרים בקטגוריה זו</div></div>
          : <div className={styles.grid3}>
              {cat.products.map(prod => (
                <button key={prod} className={styles.prodBtn}
                  onClick={() => cat.isHookah ? setHookahOpen(true) : onAdd(prod)}>
                  {prod}
                </button>
              ))}
            </div>
        }
        <hr className={styles.divider} />
        <div className={styles.row}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSummary}>
            {itemCount > 0 && <span className={styles.bdg}>{itemCount}</span>} סיכום הזמנה
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onMenu}>← תפריט</button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onBack}>🏠</button>
        </div>
      </div>
    </div>
  )
}

// ── 4. Summary ──
function SummaryScreen({ tableNum, items, note, onNoteChange, onRemove, onMenu, onBack }) {
  const buildUrl = () => {
    const lines = items.map((it, i) => `${i + 1}. ${it.name}`).join('\n')
    const n = note.trim()
    const msg = `🍹 הזמנה חדשה\n\nשולחן: ${tableNum}\n\nמוצרים:\n${lines}${n ? `\n\nהערה:\n${n}` : ''}\n\n— מערכת ניהול הבר`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
  }
  return (
    <div className={styles.screen}>
      <TopBar title={`סיכום הזמנה — שולחן ${tableNum}`} subtitle={`${items.length} פריטים`}
        right={<>
          <IconBtn onClick={onMenu}>←</IconBtn>
          <IconBtn onClick={onBack}>🏠</IconBtn>
        </>} />
      <div className={styles.content}>
        {items.length === 0
          ? <div className={styles.empty}>
              <div className={styles.emptyIcon}>🛒</div>
              <div>עדיין לא נוספו מוצרים להזמנה</div>
              <button className={`${styles.btn} ${styles.btnSecondary}`} style={{ marginTop: 18 }} onClick={onMenu}>← חזרה לתפריט</button>
            </div>
          : <>
              <ul className={styles.orderList}>
                {items.map((item, i) => (
                  <li key={item.id} className={styles.orderItem}>
                    <span className={styles.orderNum}>{i + 1}.</span>
                    <span className={styles.orderName}>{item.name}</span>
                    <button className={styles.deleteBtn} onClick={() => onRemove(item.id)}>✕</button>
                  </li>
                ))}
              </ul>
              <div className={styles.noteWrap}>
                <label className={styles.noteLbl}>הערה להזמנה</label>
                <textarea className={styles.textarea} value={note} onChange={e => onNoteChange(e.target.value)}
                  placeholder="לדוגמה: בלי קרח, דחוף, להוציא קודם את האוכל..." />
              </div>
              <div className={styles.waBox}>
                <div className={styles.waTitle}>לחץ על הכפתור לשליחה בוואטסאפ:</div>
                <a className={styles.waLink} href={buildUrl()} target="_blank" rel="noopener">
                  📲 שלח הזמנה לוואטסאפ
                </a>
                <div className={styles.waNote}>אחרי הלחיצה — לחץ שלח בוואטסאפ</div>
              </div>
              <div className={styles.row}>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onMenu}>← המשך להזמין</button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onBack}>🏠</button>
              </div>
            </>
        }
      </div>
    </div>
  )
}

// ── 5. Settings ──
function SettingsScreen({ totalTables, setTotalTables, categories, setCategories, onBack }) {
  return (
    <div className={styles.screen}>
      <TopBar title="הגדרות" right={<IconBtn onClick={onBack}>✕</IconBtn>} />
      <div className={styles.content}>
        {/* Tables */}
        <div className={styles.scard}>
          <div className={styles.scardTitle}>שולחנות</div>
          <div className={styles.scardRow}>
            <span className={styles.scardLbl}>מספר שולחנות</span>
            <div className={styles.stepper}>
              <button className={styles.stepBtn} disabled={totalTables <= 1}
                onClick={() => setTotalTables(t => Math.max(1, t - 1))}>−</button>
              <span className={styles.scardVal}>{totalTables}</span>
              <button className={styles.stepBtn} disabled={totalTables >= 99}
                onClick={() => setTotalTables(t => Math.min(99, t + 1))}>+</button>
            </div>
          </div>
          <div className={styles.hint}>ניתן להגדיר בין 1 ל-99 שולחנות</div>
        </div>

        {/* Category manager */}
        <CategoryManager categories={categories} setCategories={setCategories} />

        {/* WA */}
        <div className={styles.scard}>
          <div className={styles.scardTitle}>מספר וואטסאפ</div>
          <div className={styles.scardLbl} style={{ color: 'var(--acc)', fontWeight: 700 }}>{WHATSAPP_NUMBER}</div>
          <div className={styles.hint}>לשינוי — ערוך את src/data.js</div>
        </div>

        <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnFull}`} onClick={onBack}>
          ← חזרה למסך הראשי
        </button>
      </div>
    </div>
  )
}

// ── Category Manager (inside Settings) ──
function CategoryManager({ categories, setCategories }) {
  const [openCatId, setOpenCatId] = useState(null)   // which cat is expanded
  const [newCatName, setNewCatName] = useState('')
  const [addCatErr, setAddCatErr] = useState(false)

  const openCat = categories.find(c => c.id === openCatId)

  function addCategory() {
    const name = newCatName.trim()
    if (!name) { setAddCatErr(true); return }
    setAddCatErr(false)
    setCategories(prev => [...prev, { id: 'cat_' + uid(), label: name, products: [], isHookah: false }])
    setNewCatName('')
  }

  function deleteCategory(id) {
    if (categories.length <= 1) return
    setCategories(prev => prev.filter(c => c.id !== id))
    if (openCatId === id) setOpenCatId(null)
  }

  function renameCategory(id, name) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, label: name } : c))
  }

  function addProduct(catId, name) {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, products: [...c.products, name] } : c))
  }

  function deleteProduct(catId, prodName) {
    setCategories(prev => prev.map(c => c.id === catId
      ? { ...c, products: c.products.filter(p => p !== prodName) }
      : c))
  }

  function renameProduct(catId, oldName, newName) {
    setCategories(prev => prev.map(c => c.id === catId
      ? { ...c, products: c.products.map(p => p === oldName ? newName : p) }
      : c))
  }

  return (
    <div className={styles.scard}>
      <div className={styles.scardTitle}>קטגוריות ומוצרים</div>

      {/* Category list */}
      <div className={styles.catMgrList}>
        {categories.map(cat => (
          <CategoryRow
            key={cat.id}
            cat={cat}
            isOpen={openCatId === cat.id}
            onToggle={() => setOpenCatId(openCatId === cat.id ? null : cat.id)}
            onDelete={() => deleteCategory(cat.id)}
            onRename={name => renameCategory(cat.id, name)}
            onAddProduct={name => addProduct(cat.id, name)}
            onDeleteProduct={name => deleteProduct(cat.id, name)}
            onRenameProduct={(old, nw) => renameProduct(cat.id, old, nw)}
            canDelete={categories.length > 1}
          />
        ))}
      </div>

      {/* Add category */}
      <div className={styles.addCatForm}>
        <div className={styles.modalLbl}>הוספת קטגוריה חדשה</div>
        <div className={styles.addCatRow}>
          <input
            className={`${styles.finput} ${addCatErr ? styles.inputErr : ''}`}
            placeholder="שם הקטגוריה..."
            value={newCatName}
            onChange={e => { setNewCatName(e.target.value); setAddCatErr(false) }}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={addCategory}>+ הוסף</button>
        </div>
        {addCatErr && <div className={styles.errMsg}>נא להזין שם קטגוריה</div>}
      </div>
    </div>
  )
}

// ── Single Category Row ──
function CategoryRow({ cat, isOpen, onToggle, onDelete, onRename, onAddProduct, onDeleteProduct, onRenameProduct, canDelete }) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(cat.label)
  const [newProd, setNewProd] = useState('')
  const [prodErr, setProdErr] = useState(false)

  function saveRename() {
    const v = editVal.trim()
    if (v) onRename(v)
    else setEditVal(cat.label)
    setEditing(false)
  }

  function handleAddProd() {
    const v = newProd.trim()
    if (!v) { setProdErr(true); return }
    if (cat.products.includes(v)) { setProdErr(true); return }
    onAddProduct(v)
    setNewProd('')
    setProdErr(false)
  }

  return (
    <div className={styles.catMgrRow}>
      {/* Header */}
      <div className={styles.catMgrHeader}>
        <button className={styles.catToggle} onClick={onToggle}>
          <span className={styles.catToggleArrow}>{isOpen ? '▾' : '▸'}</span>
          {editing
            ? <input
                className={styles.inlineInput}
                value={editVal}
                autoFocus
                onChange={e => setEditVal(e.target.value)}
                onBlur={saveRename}
                onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') { setEditVal(cat.label); setEditing(false) } }}
                onClick={e => e.stopPropagation()}
              />
            : <span className={styles.catMgrName}>{cat.label}</span>
          }
          <span className={styles.catMgrCount}>({cat.products.length})</span>
        </button>
        <div className={styles.catMgrActions}>
          <button className={styles.editBtn} title="שנה שם" onClick={e => { e.stopPropagation(); setEditing(true); setEditVal(cat.label) }}>✏️</button>
          {canDelete && <button className={styles.delBtn} title="מחק קטגוריה" onClick={e => { e.stopPropagation(); onDelete() }}>🗑️</button>}
        </div>
      </div>

      {/* Products (expanded) */}
      {isOpen && (
        <div className={styles.prodMgr}>
          {cat.products.length === 0
            ? <div className={styles.prodEmpty}>אין מוצרים עדיין</div>
            : <ul className={styles.prodList}>
                {cat.products.map(prod => (
                  <ProductRow
                    key={prod}
                    name={prod}
                    onDelete={() => onDeleteProduct(prod)}
                    onRename={nw => onRenameProduct(prod, nw)}
                  />
                ))}
              </ul>
          }
          {/* Add product */}
          <div className={styles.addProdRow}>
            <input
              className={`${styles.finput} ${styles.finputSm} ${prodErr ? styles.inputErr : ''}`}
              placeholder="שם מוצר חדש..."
              value={newProd}
              onChange={e => { setNewProd(e.target.value); setProdErr(false) }}
              onKeyDown={e => e.key === 'Enter' && handleAddProd()}
            />
            <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={handleAddProd}>+ הוסף</button>
          </div>
          {prodErr && <div className={styles.errMsg}>מוצר ריק או כבר קיים</div>}
        </div>
      )}
    </div>
  )
}

// ── Single Product Row ──
function ProductRow({ name, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(name)

  function save() {
    const v = val.trim()
    if (v && v !== name) onRename(v)
    else setVal(name)
    setEditing(false)
  }

  return (
    <li className={styles.prodRow}>
      <span className={styles.prodDot}>·</span>
      {editing
        ? <input
            className={styles.inlineInput}
            value={val}
            autoFocus
            onChange={e => setVal(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setVal(name); setEditing(false) } }}
          />
        : <span className={styles.prodName}>{name}</span>
      }
      <div className={styles.prodActions}>
        <button className={styles.editBtn} onClick={() => { setEditing(true); setVal(name) }}>✏️</button>
        <button className={styles.delBtn} onClick={onDelete}>🗑️</button>
      </div>
    </li>
  )
}

// ══════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState('tables')
  const [tableNum, setTableNum] = useState(null)
  const [catId, setCatId] = useState(null)
  const [items, setItems] = useState([])
  const [note, setNote] = useState('')
  const [totalTables, setTotalTables] = useState(30)
  const [categories, setCategories] = useState(() => deepClone(DEFAULT_CATEGORIES))

  const [toast, showToast] = useToast()

  const currentCat = categories.find(c => c.id === catId)
  const itemCount = items.length

  function selectTable(n) { setTableNum(n); setItems([]); setNote(''); setScreen('menu') }
  function addItem(name) { setItems(prev => [...prev, { id: uid(), name }]) }
  function removeItem(id) { setItems(prev => prev.filter(i => i.id !== id)) }

  return (
    <>
      {screen === 'tables' &&
        <TablesScreen totalTables={totalTables} onSelect={selectTable} onSettings={() => setScreen('settings')} />}

      {screen === 'settings' &&
        <SettingsScreen totalTables={totalTables} setTotalTables={setTotalTables}
          categories={categories} setCategories={setCategories}
          onBack={() => setScreen('tables')} />}

      {screen === 'menu' &&
        <MenuScreen tableNum={tableNum} categories={categories} itemCount={itemCount}
          onCategory={id => { setCatId(id); setScreen('category') }}
          onSummary={() => setScreen('summary')}
          onBack={() => setScreen('tables')} />}

      {screen === 'category' && currentCat &&
        <CategoryScreen tableNum={tableNum} cat={currentCat} itemCount={itemCount}
          onAdd={name => { addItem(name); showToast(`✓ ${name} נוסף`) }}
          onSummary={() => setScreen('summary')}
          onMenu={() => setScreen('menu')}
          onBack={() => setScreen('tables')} />}

      {screen === 'summary' &&
        <SummaryScreen tableNum={tableNum} items={items} note={note}
          onNoteChange={setNote}
          onRemove={removeItem}
          onMenu={() => setScreen('menu')}
          onBack={() => { setItems([]); setNote(''); setScreen('tables') }} />}

      {toast && <div className={`${styles.toast} ${toast.err ? styles.toastErr : ''}`}>{toast.msg}</div>}
    </>
  )
}
