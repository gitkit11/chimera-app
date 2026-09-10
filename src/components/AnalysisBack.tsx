import type { ApiAnalysis, RecentMatch, FormSummary } from '../api'

// Обратная сторона карточки — «Разбор» (10.09.2026).
// Не «три агента с галочками», а логика ставки: вердикт с цифрами модели и
// рынка, «почему это не очевидно» из базы, цепочка формул с реальными
// числами, сила и форма команд, последние матчи, ИИ-аналитик, риски.
const f    = "'Clash Display','Unbounded',sans-serif"
const mono = "'JetBrains Mono','SF Mono',monospace"

const RES_COLOR: Record<string, string> = { W: '#34D399', D: '#FBBF24', L: '#F87171' }

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 3, height: 12, borderRadius: 2, background: accent, boxShadow: `0 0 8px ${accent}99` }} />
        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: `${accent}cc` }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function Bullets({ items, color, marker }: { items: string[]; color: string; marker: string }) {
  return (
    <div style={{ display: 'grid', gap: 7 }}>
      {items.map((t, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 8, alignItems: 'start',
          fontFamily: f, fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,.86)' }}>
          <span style={{ color, fontWeight: 900, lineHeight: 1.45 }}>{marker}</span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  )
}

function FormRow({ s }: { s: FormSummary | null }) {
  if (!s) return <span style={{ color: 'rgba(255,255,255,.3)' }}>—</span>
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {s.string.split('').map((ch, i) => (
        <span key={i} style={{ width: 16, height: 16, borderRadius: 4, display: 'inline-grid', placeItems: 'center',
          fontFamily: mono, fontSize: 9, fontWeight: 800, color: '#04020D', background: RES_COLOR[ch] ?? '#64748B' }}>{ch}</span>
      ))}
    </span>
  )
}

function Recent({ list }: { list: RecentMatch[] }) {
  if (!list?.length) return <div style={{ fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.3)' }}>нет данных</div>
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {list.slice(0, 5).map((m, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', gap: 6, alignItems: 'center',
          fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.7)' }}>
          <span style={{ color: RES_COLOR[m.res], fontWeight: 800 }}>{m.res}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'rgba(255,255,255,.35)' }}>{m.home ? 'д' : 'г'} · </span>{m.opp}
          </span>
          <span style={{ fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>{m.score ?? ''}</span>
        </div>
      ))}
    </div>
  )
}

function ProbPair({ label, model, market, accent }: { label: string; model: number; market: number | null; accent: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr 62px', gap: 8, alignItems: 'center' }}>
      <span style={{ fontFamily: mono, fontSize: 9.5, color: 'rgba(255,255,255,.55)', letterSpacing: '.08em' }}>{label}</span>
      <div style={{ position: 'relative', height: 8, borderRadius: 4, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}>
        {market !== null && <div style={{ position: 'absolute', inset: 0, width: `${market}%`, background: 'rgba(255,255,255,.22)' }} />}
        <div style={{ position: 'absolute', inset: 0, width: `${model}%`, background: accent, opacity: .85 }} />
      </div>
      <span style={{ fontFamily: mono, fontSize: 10, textAlign: 'right', color: 'rgba(255,255,255,.85)', fontVariantNumeric: 'tabular-nums' }}>
        {model}%<span style={{ color: 'rgba(255,255,255,.35)' }}>{market !== null ? ` / ${market}` : ''}</span>
      </span>
    </div>
  )
}

export default function AnalysisBack({ a, accent, home, away }: { a: ApiAnalysis; accent: string; home: string; away: string }) {
  const v = a.verdict
  const edgeGood = (v.edge_pp ?? 0) >= 2
  const st = a.strength
  return (
    <div style={{ width: '100%' }}>
      {/* Вердикт */}
      <div style={{ padding: '14px 16px', borderRadius: 14, background: `${accent}14`, border: `1px solid ${accent}55`,
        boxShadow: `0 0 24px ${accent}22`, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontFamily: f, fontWeight: 900, fontSize: 20, lineHeight: 1.1 }}>{v.pick}</div>
          {v.odds && <div style={{ fontFamily: f, fontWeight: 900, fontSize: 22, color: accent }}>{v.odds.toFixed(2)}</div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
          {[
            ['Модель', `${v.p_model.toFixed(0)}%`, '#FAFAF8'],
            ['Рынок', v.p_market !== null ? `${v.p_market.toFixed(0)}%` : '—', 'rgba(255,255,255,.7)'],
            ['Перевес', v.edge_pp !== null ? `${v.edge_pp >= 0 ? '+' : ''}${v.edge_pp.toFixed(0)} п.п.` : '—', edgeGood ? '#34D399' : '#FBBF24'],
          ].map(([l, val, col]) => (
            <div key={l as string}>
              <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 3 }}>{l}</div>
              <div style={{ fontFamily: f, fontWeight: 800, fontSize: 17, color: col as string }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', fontFamily: mono, fontSize: 10, color: 'rgba(255,255,255,.6)' }}>
          {v.ev !== null && <span>EV <b style={{ color: v.ev >= 0 ? '#34D399' : '#F87171' }}>{v.ev >= 0 ? '+' : ''}{v.ev.toFixed(1)}%</b></span>}
          {v.min_odds && <span>ставь от <b style={{ color: '#FAFAF8' }}>{v.min_odds.toFixed(2)}</b></span>}
          {v.stake_pct !== undefined && <span>ставка <b style={{ color: '#FAFAF8' }}>{v.stake_pct}%</b> банка</span>}
        </div>
      </div>

      {a.insights?.length > 0 && (
        <Section title="Почему это не очевидно" accent={accent}>
          <Bullets items={a.insights} color={accent} marker="◆" />
        </Section>
      )}

      {a.formulas?.length > 0 && (
        <Section title="Как посчитано" accent={accent}>
          <div style={{ display: 'grid', gap: 6, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
            {a.formulas.map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '16px 1fr', gap: 6, fontFamily: mono, fontSize: 10.5, lineHeight: 1.45, color: 'rgba(255,255,255,.78)', fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ color: `${accent}aa` }}>{i + 1}.</span><span>{t}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {a.probs && a.market === '1x2' && (
        <Section title="Модель против рынка" accent={accent}>
          <div style={{ display: 'grid', gap: 6 }}>
            <ProbPair label="П1" model={a.probs.model.home} market={a.probs.market.home} accent={accent} />
            {a.probs.model.draw !== null && <ProbPair label="X" model={a.probs.model.draw} market={a.probs.market.draw} accent={accent} />}
            <ProbPair label="П2" model={a.probs.model.away} market={a.probs.market.away} accent={accent} />
          </div>
          <div style={{ fontFamily: mono, fontSize: 8.5, color: 'rgba(255,255,255,.35)', marginTop: 5 }}>цвет — модель, серое — рынок без маржи</div>
        </Section>
      )}

      {(st.elo || st.xg || st.form.home || st.form.away) && (
        <Section title="Сила и форма" accent={accent}>
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.03)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr', padding: '7px 12px', fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span></span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home}</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{away}</span>
            </div>
            {[
              st.elo ? ['ELO', String(st.elo.home), String(st.elo.away)] : null,
              st.xg ? ['xG', st.xg.home.toFixed(2), st.xg.away.toFixed(2)] : null,
              (st.form.home?.avg_total != null || st.form.away?.avg_total != null)
                ? ['Ср. голов', st.form.home?.avg_total?.toFixed(1) ?? '—', st.form.away?.avg_total?.toFixed(1) ?? '—'] : null,
              (st.form.home || st.form.away)
                ? ['Побед из 5', st.form.home ? `${st.form.home.wins}` : '—', st.form.away ? `${st.form.away.wins}` : '—'] : null,
              st.surface ? ['Покрытие', st.surface, st.surface] : null,
            ].filter(Boolean).map((row) => {
              const [l, x, y] = row as string[]
              return (
                <div key={l} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr', padding: '7px 12px', fontFamily: mono, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,.05)', fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 9, letterSpacing: '.08em', alignSelf: 'center' }}>{l}</span>
                  <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{x}</span>
                  <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>{y}</span>
                </div>
              )
            })}
            <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 1fr', padding: '8px 12px', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,.4)', fontFamily: mono, fontSize: 9, letterSpacing: '.08em' }}>Форма</span>
              <FormRow s={st.form.home} /><FormRow s={st.form.away} />
            </div>
          </div>
        </Section>
      )}

      {(a.recent.home?.length > 0 || a.recent.away?.length > 0) && (
        <Section title="Последние матчи" accent={accent}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{home}</div><Recent list={a.recent.home} /></div>
            <div><div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.4)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{away}</div><Recent list={a.recent.away} /></div>
          </div>
        </Section>
      )}

      {a.h2h && a.h2h.n >= 2 && (
        <Section title="Личные встречи" accent={accent}>
          <div style={{ fontFamily: f, fontSize: 13, color: 'rgba(255,255,255,.86)' }}>
            {a.h2h.n} матч(а): {a.h2h.home_wins} побед {home}, {a.h2h.draws} ничьих, {a.h2h.away_wins} побед {away}
            {a.h2h.avg_total != null ? ` · в среднем ${a.h2h.avg_total.toFixed(1)} гола` : ''}
          </div>
        </Section>
      )}

      {(a.ai.reasoning || a.ai.blind || a.ai.judge || a.ai.scout) && (
        <Section title="ИИ-аналитик" accent={accent}>
          <div style={{ display: 'grid', gap: 8 }}>
            {a.ai.reasoning && (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', fontFamily: f, fontSize: 13, lineHeight: 1.45, color: 'rgba(255,255,255,.86)' }}>
                {a.ai.reasoning}
                <div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 6 }}>
                  уверенность {a.ai.confidence ?? '—'} · риск {a.ai.risk ?? '—'} · {a.ai.unanimous ? 'два ИИ согласны' : 'мнения ИИ расходятся'}
                  {a.ai.judge?.verdict ? ` · судья: ${a.ai.judge.verdict}` : ''}
                </div>
              </div>
            )}
            {a.ai.blind?.key_factor && (
              <div style={{ padding: '9px 12px', borderRadius: 10, borderLeft: `2px solid ${accent}88`, background: `${accent}0d` }}>
                <div style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: '.16em', textTransform: 'uppercase', color: `${accent}aa`, marginBottom: 4 }}>Слепой ИИ · без кэфов</div>
                <div style={{ fontFamily: f, fontSize: 12.5, lineHeight: 1.45, color: 'rgba(255,255,255,.82)' }}>{a.ai.blind.key_factor}</div>
                {a.ai.blind.questions?.slice(0, 2).map((q, i) => (
                  <div key={i} style={{ marginTop: 6, fontFamily: mono, fontSize: 10, lineHeight: 1.45, color: 'rgba(255,255,255,.6)' }}>
                    <span style={{ color: 'rgba(255,255,255,.4)' }}>{q.q}</span><br />{q.a}
                  </div>
                ))}
              </div>
            )}
            {a.ai.scout?.finding && (
              <div style={{ fontFamily: mono, fontSize: 10.5, lineHeight: 1.45, color: 'rgba(255,255,255,.6)' }}>Скаут: {a.ai.scout.finding}{a.ai.scout.reason ? ` — ${a.ai.scout.reason}` : ''}</div>
            )}
          </div>
        </Section>
      )}

      {a.risks?.length > 0 && (
        <Section title="Риски" accent="#F87171">
          <Bullets items={a.risks} color="#F87171" marker="!" />
        </Section>
      )}
    </div>
  )
}
