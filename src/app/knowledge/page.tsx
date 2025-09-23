"use client";

import { Plus, Upload, Download, FileText, ListTree, Sparkles, History, Link as LinkIcon, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/app/lib/firebase';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, setDoc, getDoc } from 'firebase/firestore';

type FaqItem = { id: string; question: string; answer: string; category?: string };
type ScenarioItem = { id: string; title: string; description?: string };

export default function KnowledgePage() {
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [scenarioEditing, setScenarioEditing] = useState<ScenarioItem | null>(null);
  const [showScenarioEditor, setShowScenarioEditor] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [oosKeywords, setOosKeywords] = useState<string>('');
  const [oosFallback, setOosFallback] = useState<string>('');
  const oosTimerRef = useRef<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'knowledge_faq'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setFaq(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as FaqItem[]);
    });
    const qs = query(collection(db, 'knowledge_scenarios'), orderBy('createdAt', 'desc'));
    const unb = onSnapshot(qs, (snap) => {
      setScenarios(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ScenarioItem[]);
    });
    (async () => {
      const ref = doc(db, 'knowledge_oos', 'default');
      const s = await getDoc(ref);
      const d = s.data() as any;
      if (d) {
        setOosKeywords(d.keywords || '');
        setOosFallback(d.fallback || '');
      }
    })();
    return () => { unsub(); unb(); };
  }, []);

  const filtered = faq.filter((i) => {
    const catOk = category === 'All' || (i.category || 'General') === category;
    const text = `${i.question}\n${i.answer}\n${i.category || ''}`.toLowerCase();
    const s = search.trim().toLowerCase();
    return catOk && (!s || text.includes(s));
  });

  const openAdd = () => {
    setEditing({ id: '', question: '', answer: '', category: 'General' });
    setShowEditor(true);
  };

  const openEdit = (item: FaqItem) => {
    setEditing(item);
    setShowEditor(true);
  };

  const saveItem = async () => {
    if (!editing) return;
    const payload = {
      question: editing.question?.trim() || '',
      answer: editing.answer?.trim() || '',
      category: editing.category || 'General',
    };
    if (!payload.question || !payload.answer) {
      setFormError('Please fill Question and Answer');
      return;
    }
    if (editing.id) {
      await updateDoc(doc(db, 'knowledge_faq', editing.id), payload as any);
    } else {
      await addDoc(collection(db, 'knowledge_faq'), { ...payload, createdAt: serverTimestamp() } as any);
    }
    setShowEditor(false);
    setFormError('');
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await deleteDoc(doc(db, 'knowledge_faq', id));
  };

  const triggerImport = () => fileInputRef.current?.click();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const items: any[] = Array.isArray(json) ? json : json.items || [];
      for (const it of items) {
        if (it?.question && it?.answer) {
          await addDoc(collection(db, 'knowledge_faq'), {
            question: String(it.question),
            answer: String(it.answer),
            category: String(it.category || 'General'),
          } as any);
        }
      }
    } catch {

      const lines = text.split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        const [q, a, c] = line.split(',');
        if (q && a) {
          await addDoc(collection(db, 'knowledge_faq'), {
            question: q.trim(),
            answer: a.trim(),
            category: (c || 'General').trim(),
          } as any);
        }
      }
    }
    e.target.value = '';
  };

  const handleExport = () => {
    const data = { items: faq };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSyncDocs = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/knowledge/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: faq }),
      });
      if (!res.ok) throw new Error('Sync failed');
      // optional UI feedback
      console.log('Synced knowledge to n8n/Google Docs');
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };


  const scheduleSaveOos = (nextKeywords: string, nextFallback: string) => {
    if (oosTimerRef.current) clearTimeout(oosTimerRef.current);
    oosTimerRef.current = setTimeout(async () => {
      await setDoc(doc(db, 'knowledge_oos', 'default'), {
        keywords: nextKeywords,
        fallback: nextFallback,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }, 500);
  };

  const saveScenario = async () => {
    if (!scenarioEditing) return;
    const payload = {
      title: (scenarioEditing.title || '').trim(),
      description: (scenarioEditing.description || '').trim(),
    } as any;
    if (!payload.title) return;
    if (scenarioEditing.id) {
      await updateDoc(doc(db, 'knowledge_scenarios', scenarioEditing.id), payload);
    } else {
      await addDoc(collection(db, 'knowledge_scenarios'), { ...payload, createdAt: serverTimestamp() });
    }
    setShowScenarioEditor(false);
  };

  const deleteScenario = async (id: string) => {
    if (!confirm('Delete this scenario?')) return;
    await deleteDoc(doc(db, 'knowledge_scenarios', id));
  };
  return (
    <div className="max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-heading mb-6">Knowledge</h1>

      {/* Actions bar */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition-colors"><Plus size={16}/> Add item</button>
        <button onClick={triggerImport} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-700 text-sm px-4 py-2 rounded-md transition-colors"><Upload size={16}/> Import CSV/JSON</button>
        <input ref={fileInputRef} onChange={handleImport} type="file" accept=".json,.csv" className="hidden" />
        <button onClick={handleExport} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-700 text-sm px-4 py-2 rounded-md transition-colors"><Download size={16}/> Export</button>
        <button onClick={handleSyncDocs} disabled={syncing} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-700 text-sm px-4 py-2 rounded-md transition-colors disabled:opacity-60"><LinkIcon size={16}/> {syncing ? 'Syncing…' : 'Google Docs sync'}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ */}
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <header className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><FileText className="text-blue-600" size={18}/><h2 className="text-lg font-semibold">Knowledge Base (FAQ)</h2></div>
            <div className="flex items-center gap-2">
              <select value={category} onChange={(e)=>setCategory(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option>All</option>
                <option>Menu</option>
                <option>Booking</option>
                <option>Delivery</option>
                <option>Promotions</option>
                <option>General</option>
              </select>
              <input value={search} onChange={(e)=>setSearch(e.target.value)} className="border rounded-md px-3 py-2 text-sm" placeholder="Search" />
            </div>
          </header>
          <div className="p-4 md:p-5">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {filtered.map((item) => (
                <div key={item.id} className="group border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-colors cursor-pointer">
                  <div className="text-sm font-medium text-gray-900 mb-1">{item.question}</div>
                  <div className="text-sm text-gray-600">{item.answer}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">{item.category || 'General'}</span>
                    <button onClick={()=>openEdit(item)} className="ml-auto text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={()=>deleteItem(item.id)} className="text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1"><Trash2 size={14}/>Delete</button>
                  </div>
                </div>
              ))}
              {faq.length === 0 && <div className="text-sm text-gray-500">No knowledge yet. Use Import or Add item.</div>}
            </div>
          </div>
        </section>

        {/* Dialog scenarios */}
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <header className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><ListTree className="text-blue-600" size={18}/><h2 className="text-lg font-semibold">Dialog Scenarios</h2></div>
            <button onClick={()=>{ setScenarioEditing({ id:'', title:'', description:'' }); setShowScenarioEditor(true); }} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md"><Plus size={16}/> New scenario</button>
          </header>
          <div className="p-4 md:p-5 space-y-3">
            {scenarios.map((s) => (
              <div key={s.id} className="border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">{s.title}</div>
                  <div className="flex items-center gap-3">
                    <button onClick={()=>{ setScenarioEditing(s); setShowScenarioEditor(true); }} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={()=>deleteScenario(s.id)} className="text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1"><Trash2 size={14}/>Delete</button>
                  </div>
                </div>
                {s.description && <div className="mt-2 text-xs text-gray-600">{s.description}</div>}
              </div>
            ))}
            {scenarios.length === 0 && <div className="text-sm text-gray-500">No scenarios yet. Click “New scenario”.</div>}
          </div>
        </section>

        {/* Out-of-scope handling */}
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <header className="p-4 md:p-5 border-b border-gray-100 flex items-center gap-2"><Sparkles className="text-blue-600" size={18}/><h2 className="text-lg font-semibold">Out-of-scope</h2></header>
          <div className="p-4 md:p-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Keywords</label>
              <input
                value={oosKeywords}
                onChange={(e)=>{ setOosKeywords(e.target.value); scheduleSaveOos(e.target.value, oosFallback); }}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="e.g. parking, pets, vegan"
              />
              <div className="mt-1 text-xs text-gray-500">Comma-separated</div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Fallback response</label>
              <textarea
                value={oosFallback}
                onChange={(e)=>{ setOosFallback(e.target.value); scheduleSaveOos(oosKeywords, e.target.value); }}
                className="w-full border rounded-md px-3 py-2 text-sm" rows={3}
                placeholder="Sorry, I didn't get that. Could you rephrase?"
              />
            </div>
          </div>
        </section>

        {/* History & training */}
        <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <header className="p-4 md:p-5 border-b border-gray-100 flex items-center gap-2"><History className="text-blue-600" size={18}/><h2 className="text-lg font-semibold">History & Training</h2></header>
          <div className="p-4 md:p-5 space-y-3">
            {['Do you have gluten‑free menu?','Is there parking near the restaurant?'].map((q,idx) => (
              <div key={idx} className="flex items-start gap-3 border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-colors">
                <div className="text-sm text-gray-900 flex-1">User: {q}<br/>Agent: —</div>
                <button onClick={()=>{ setEditing({ id:'', question: q, answer:'', category:'General' }); setShowEditor(true); }} className="text-sm text-blue-600 hover:underline">Add to FAQ</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Editor modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm font-semibold">{editing?.id ? 'Edit item' : 'Add item'}</div>
              <button onClick={()=>setShowEditor(false)} className="text-gray-500 hover:text-gray-800"><X size={18}/></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Question</label>
                <input value={editing?.question || ''} onChange={(e)=>setEditing((p)=>({ ...(p as any), question: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Answer</label>
                <textarea value={editing?.answer || ''} onChange={(e)=>setEditing((p)=>({ ...(p as any), answer: e.target.value }))} rows={4} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select value={editing?.category || 'General'} onChange={(e)=>setEditing((p)=>({ ...(p as any), category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option>General</option>
                  <option>Menu</option>
                  <option>Booking</option>
                  <option>Delivery</option>
                  <option>Promotions</option>
                </select>
              </div>
              {formError && <div className="text-sm text-red-600">{formError}</div>}
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={()=>setShowEditor(false)} className="px-4 py-2 rounded-md border text-sm">Cancel</button>
              <button onClick={saveItem} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm" disabled={!editing?.question || !editing?.answer}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Editor modal */}
      {showScenarioEditor && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="text-sm font-semibold">{scenarioEditing?.id ? 'Edit scenario' : 'New scenario'}</div>
              <button onClick={()=>setShowScenarioEditor(false)} className="text-gray-500 hover:text-gray-800"><X size={18}/></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title</label>
                <input value={scenarioEditing?.title || ''} onChange={(e)=>setScenarioEditing((p)=>({ ...(p as any), title: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea value={scenarioEditing?.description || ''} onChange={(e)=>setScenarioEditing((p)=>({ ...(p as any), description: e.target.value }))} rows={4} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={()=>setShowScenarioEditor(false)} className="px-4 py-2 rounded-md border text-sm">Cancel</button>
              <button onClick={saveScenario} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}