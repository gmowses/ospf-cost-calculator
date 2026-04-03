import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Plus, Trash2, Calculator, ArrowRight } from 'lucide-react'

const translations = {
  en: {
    title: 'OSPF Cost Calculator',
    subtitle: 'Calculate OSPF interface costs, compare paths and determine which route OSPF prefers.',
    refBw: 'Reference Bandwidth',
    refBwMbps: 'Mbps (default: 100)',
    links: 'Links / Interfaces',
    addLink: 'Add Link',
    linkName: 'Interface Name',
    linkBw: 'Bandwidth (Mbps)',
    linkCost: 'Cost',
    paths: 'Path Comparison',
    pathA: 'Path A',
    pathB: 'Path B',
    pathALinks: 'Path A Links',
    pathBLinks: 'Path B Links',
    totalCost: 'Total Cost',
    ospfChooses: 'OSPF Chooses',
    tie: 'Tie (equal cost)',
    formula: 'Cost = Reference BW / Interface BW (minimum 1)',
    noLinks: 'No links added yet.',
    linkNamePlaceholder: 'e.g. GigabitEthernet0/0',
    addToPathA: 'Add to Path A',
    addToPathB: 'Add to Path B',
    removeFromPath: 'Remove',
    references: 'References',
    refList: ['RFC 2328 - OSPF Version 2 (Section 16: Dijkstra / SPF)'],
    builtBy: 'Built by',
    lower: 'lower',
    cost: 'cost',
  },
  pt: {
    title: 'Calculadora de Custo OSPF',
    subtitle: 'Calcule o custo de interfaces OSPF, compare caminhos e determine qual rota o OSPF prefere.',
    refBw: 'Banda de Referencia',
    refBwMbps: 'Mbps (padrao: 100)',
    links: 'Links / Interfaces',
    addLink: 'Adicionar Link',
    linkName: 'Nome da Interface',
    linkBw: 'Largura de Banda (Mbps)',
    linkCost: 'Custo',
    paths: 'Comparacao de Caminhos',
    pathA: 'Caminho A',
    pathB: 'Caminho B',
    pathALinks: 'Links do Caminho A',
    pathBLinks: 'Links do Caminho B',
    totalCost: 'Custo Total',
    ospfChooses: 'OSPF Escolhe',
    tie: 'Empate (custo igual)',
    formula: 'Custo = BW de Referencia / BW da Interface (minimo 1)',
    noLinks: 'Nenhum link adicionado ainda.',
    linkNamePlaceholder: 'ex: GigabitEthernet0/0',
    addToPathA: 'Adicionar ao Caminho A',
    addToPathB: 'Adicionar ao Caminho B',
    removeFromPath: 'Remover',
    references: 'Referencias',
    refList: ['RFC 2328 - OSPF Versao 2 (Secao 16: Dijkstra / SPF)'],
    builtBy: 'Criado por',
    lower: 'menor',
    cost: 'custo',
  },
} as const

type Lang = keyof typeof translations

interface Link {
  id: string
  name: string
  bw: number
}

let uid = 0

function calcCost(refBw: number, ifBw: number): number {
  if (ifBw <= 0) return 1
  return Math.max(1, Math.floor(refBw / ifBw))
}

export default function OspfCostCalculator() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [refBw, setRefBw] = useState(100)
  const [links, setLinks] = useState<Link[]>([
    { id: 'l0', name: 'FastEthernet0/0', bw: 100 },
    { id: 'l1', name: 'GigabitEthernet0/1', bw: 1000 },
    { id: 'l2', name: 'Serial0/0', bw: 1.544 },
  ])
  const [newName, setNewName] = useState('')
  const [newBw, setNewBw] = useState(1000)
  const [pathA, setPathA] = useState<string[]>(['l0'])
  const [pathB, setPathB] = useState<string[]>(['l1'])

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const addLink = () => {
    const name = newName.trim()
    if (!name || newBw <= 0) return
    const id = `l${uid++}`
    setLinks(prev => [...prev, { id, name, bw: newBw }])
    setNewName('')
    setNewBw(1000)
  }

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id))
    setPathA(prev => prev.filter(x => x !== id))
    setPathB(prev => prev.filter(x => x !== id))
  }

  const togglePath = (path: 'A' | 'B', id: string) => {
    if (path === 'A') setPathA(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    else setPathB(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const totalCostA = pathA.reduce((sum, id) => {
    const lnk = links.find(l => l.id === id)
    return sum + (lnk ? calcCost(refBw, lnk.bw) : 0)
  }, 0)

  const totalCostB = pathB.reduce((sum, id) => {
    const lnk = links.find(l => l.id === id)
    return sum + (lnk ? calcCost(refBw, lnk.bw) : 0)
  }, 0)

  const winner = totalCostA < totalCostB ? 'A' : totalCostB < totalCostA ? 'B' : 'tie'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Calculator size={18} className="text-white" />
            </div>
            <span className="font-semibold">OSPF Cost Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/ospf-cost-calculator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Ref BW */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-sm font-medium whitespace-nowrap">{t.refBw}</label>
              <input
                type="number"
                min={1}
                value={refBw}
                onChange={e => setRefBw(Number(e.target.value))}
                className="w-36 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="text-sm text-zinc-500">{t.refBwMbps}</span>
              <span className="ml-auto text-xs text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">{t.formula}</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Add link */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
              <h2 className="font-semibold">{t.links}</h2>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLink()}
                  placeholder={t.linkNamePlaceholder}
                  className="flex-1 min-w-[140px] rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  min={0.001}
                  step={0.001}
                  value={newBw}
                  onChange={e => setNewBw(Number(e.target.value))}
                  className="w-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button onClick={addLink} className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors">
                  <Plus size={14} />{t.addLink}
                </button>
              </div>

              {links.length === 0 ? (
                <p className="text-sm text-zinc-400 py-4 text-center">{t.noLinks}</p>
              ) : (
                <div className="space-y-2">
                  {links.map(lnk => {
                    const cost = calcCost(refBw, lnk.bw)
                    const inA = pathA.includes(lnk.id)
                    const inB = pathB.includes(lnk.id)
                    return (
                      <div key={lnk.id} className="flex items-center gap-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{lnk.name}</div>
                          <div className="text-xs text-zinc-500">{lnk.bw} Mbps</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-500 tabular-nums">{cost}</div>
                          <div className="text-[10px] text-zinc-400">{t.linkCost}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => togglePath('A', lnk.id)} className={`text-[10px] px-2 py-1 rounded font-medium border transition-colors ${inA ? 'bg-blue-500 text-white border-blue-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}>A</button>
                          <button onClick={() => togglePath('B', lnk.id)} className={`text-[10px] px-2 py-1 rounded font-medium border transition-colors ${inB ? 'bg-purple-500 text-white border-purple-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}>B</button>
                          <button onClick={() => removeLink(lnk.id)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Path comparison */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
              <h2 className="font-semibold">{t.paths}</h2>

              <div className="grid grid-cols-2 gap-4">
                {(['A', 'B'] as const).map(path => {
                  const pathLinks = path === 'A' ? pathA : pathB
                  const total = path === 'A' ? totalCostA : totalCostB
                  const color = path === 'A' ? 'blue' : 'purple'
                  return (
                    <div key={path} className={`rounded-xl border-2 p-4 ${path === 'A' ? 'border-blue-500/40 bg-blue-500/5' : 'border-purple-500/40 bg-purple-500/5'}`}>
                      <div className={`font-bold text-sm mb-3 ${path === 'A' ? 'text-blue-500' : 'text-purple-500'}`}>{path === 'A' ? t.pathA : t.pathB}</div>
                      <div className="space-y-1.5 mb-3">
                        {pathLinks.length === 0 ? (
                          <p className="text-xs text-zinc-400">—</p>
                        ) : pathLinks.map(id => {
                          const lnk = links.find(l => l.id === id)
                          if (!lnk) return null
                          const c = calcCost(refBw, lnk.bw)
                          return (
                            <div key={id} className="flex items-center justify-between text-xs">
                              <span className="text-zinc-600 dark:text-zinc-400 truncate max-w-[100px]">{lnk.name}</span>
                              <span className={`font-mono font-bold ${color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`}>{c}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-500">{t.totalCost}</span>
                        <span className={`text-2xl font-bold tabular-nums ${path === 'A' ? 'text-blue-500' : 'text-purple-500'}`}>{total}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={`rounded-xl p-4 flex items-center gap-3 ${winner === 'tie' ? 'bg-zinc-100 dark:bg-zinc-800' : winner === 'A' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-purple-500/10 border border-purple-500/30'}`}>
                <ArrowRight size={18} className={winner === 'A' ? 'text-blue-500' : winner === 'B' ? 'text-purple-500' : 'text-zinc-400'} />
                <div>
                  <div className="text-xs text-zinc-500 font-medium">{t.ospfChooses}</div>
                  <div className={`font-bold ${winner === 'A' ? 'text-blue-500' : winner === 'B' ? 'text-purple-500' : 'text-zinc-500'}`}>
                    {winner === 'tie' ? t.tie : `${winner === 'A' ? t.pathA : t.pathB} (${t.lower} ${t.cost}: ${winner === 'A' ? totalCostA : totalCostB})`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <h2 className="font-semibold mb-3">{t.references}</h2>
            <ul className="space-y-1">
              {t.refList.map(ref => (
                <li key={ref} className="text-sm text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>{ref}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-green-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
