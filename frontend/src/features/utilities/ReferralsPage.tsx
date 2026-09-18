import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { errorText, utilityApi, utilityKey, type Page } from "./api";
import { UtilityHero } from "./UtilityHero";
import { useUtilitySummary } from "./useUtilitySummary";
import "./utilities.css";

type Referral = { id: string; status: string; reward: number; reason: string; created_at: string };
type Mine = Page<Referral> & { code: string | null; settings: { enabled: boolean; reward: number }; balance: number; credited: number };
const states: Record<string, string> = { pending: "Pendiente de revisión", credited: "Créditos abonados", rejected: "No aprobado" };

export function ReferralsPage() {
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const client = useQueryClient();
  const summary = useUtilitySummary();
  const query = useQuery({ queryKey: utilityKey("referrals", page), queryFn: ({ signal }) => utilityApi<Mine>(`/referrals/me?page=${page}`, "GET", undefined, signal) });
  const mutation = useMutation({ mutationFn: () => utilityApi("/referrals/code", "PUT"), onSuccess: () => client.invalidateQueries({ queryKey: utilityKey("referrals") }) });
  const link = query.data?.code ? `${window.location.origin}/registro?referido=${encodeURIComponent(query.data.code)}` : "";
  return <main className="content-page utilities-page"><UtilityHero eyebrow="PROGRAMA DE REFERIDOS" title="Referidos" description="Invita a otros docentes y consulta el estado real de tus recompensas." metrics={[
    { label: "invitaciones registradas", value: summary.data?.referrals?.total ?? "—" },
    { label: "recompensas abonadas", value: summary.data?.referrals?.credited ?? "—" },
  ]}><p className="utility-hero__hint">Los créditos sólo aparecen después de una revisión válida; no se muestran recompensas estimadas como saldo real.</p></UtilityHero>
    {query.isPending ? <p>Cargando tus invitaciones…</p> : query.isError ? <p role="alert">{errorText(query.error)} <button onClick={() => void query.refetch()}>Reintentar</button></p> : <>
      <section className="utility-panel utilities-form"><h2>{query.data.settings.enabled ? "Invita a un colega" : "Programa de referidos pausado"}</h2><p>Recompensa para nuevas invitaciones: {query.data.settings.reward.toLocaleString("es-PE")} créditos IA. Cada registro requiere revisión administrativa. No se permiten autorreferidos ni recompensas repetidas.</p><p>Créditos obtenidos por referidos: <strong>{query.data.credited}</strong> · Saldo actual de tu cuenta: <strong>{query.data.balance}</strong></p>
        {link ? <><label>Tu enlace<input readOnly value={link} /></label><button className="primary-button" disabled={!query.data.settings.enabled} onClick={async () => { try { await navigator.clipboard.writeText(link); setNotice("Enlace copiado"); } catch { setNotice("Selecciona el enlace y cópialo manualmente."); } }}>Copiar enlace</button></> : <button className="primary-button" disabled={!query.data.settings.enabled || mutation.isPending} onClick={() => mutation.mutate()}>Crear mi código de invitación</button>}
        {mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}{notice ? <p role="status">{notice}</p> : null}
      </section><section className="utility-panel"><h2>Mis invitaciones · {query.data.total}</h2>{query.data.items.length === 0 ? <p>Los registros realizados con tu enlace aparecerán aquí.</p> : query.data.items.map(r => <article className="utilities-card" key={r.id}><strong>{states[r.status]}</strong><p>{r.reason}</p><small>{new Date(r.created_at).toLocaleDateString("es-PE")} · {r.reward} créditos</small></article>)}<div className="utilities-actions"><button className="secondary-button" disabled={page === 1} onClick={() => setPage(p => p-1)}>Anterior</button><span>Página {page}</span><button className="secondary-button" disabled={page*20 >= query.data.total} onClick={() => setPage(p => p+1)}>Siguiente</button></div></section>
    </>}
  </main>;
}
