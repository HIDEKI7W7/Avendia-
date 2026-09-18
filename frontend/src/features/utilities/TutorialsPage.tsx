import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { errorText, utilityApi, utilityKey, type Page } from "./api";
import { UtilityHero } from "./UtilityHero";
import { useUtilitySummary } from "./useUtilitySummary";
import "./utilities.css";

type Tutorial = { id: string; title: string; description: string; url: string; category: string;
  difficulty: string; tool_path: string; transcript: string; published: boolean; position: number;
  seconds: number; completed: boolean; favorite: boolean };

export function TutorialsPage() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const summary = useUtilitySummary();
  const query = useQuery({ queryKey: utilityKey("tutorials", page, search), queryFn: ({ signal }) => utilityApi<Page<Tutorial>>(`/tutorials?page=${page}&q=${encodeURIComponent(search)}`, "GET", undefined, signal) });
  const mutation = useMutation({ mutationFn: ({ path, method = "PUT", body }: { path: string; method?: string; body: unknown }) => utilityApi(path, method, body), onSuccess: () => client.invalidateQueries({ queryKey: utilityKey("tutorials") }) });
  const nextTutorial = query.data?.items.find((tutorial) => !tutorial.completed);
  return <main className="content-page utilities-page"><UtilityHero eyebrow="CENTRO DE APRENDIZAJE" title="Videos tutoriales" description="Avanza paso a paso, retoma tus videos y practica directamente en cada herramienta." metrics={[
    { label: "tutoriales publicados", value: summary.data?.tutorials?.published ?? "—" },
    { label: "completados por ti", value: summary.data?.tutorials?.completed ?? "—" },
  ]} action={nextTutorial ? <button className="primary-button" onClick={() => setPlaying(nextTutorial.id)}>Continuar: {nextTutorial.title}</button> : undefined}>
    <p className="utility-hero__hint">Tu progreso se guarda en tu cuenta. La ruta recomendada muestra solo tutoriales publicados.</p>
  </UtilityHero>
    {mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}
    <section className="utility-panel"><label className="utilities-form">Buscar por título, categoría o transcripción<input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Ej. Exportar una rúbrica" /></label>
      {query.isPending ? <p role="status">Cargando biblioteca…</p> : query.isError ? <p role="alert">{errorText(query.error)} <button onClick={() => void query.refetch()}>Reintentar</button></p> : <>
        {query.data.total === 0 ? <p>Aún no hay tutoriales disponibles con estos filtros. Los videos publicados por administración aparecerán aquí.</p> : null}
        {query.data.items.map(t => <article className="utilities-card" key={t.id}><small>{t.category} · {t.difficulty} · {t.published ? "Publicado" : "Borrador"}</small><h2>{t.title}</h2><p>{t.description}</p><p>{t.completed ? "Completado" : `Última posición guardada: ${Math.floor(t.seconds/60)}:${String(t.seconds%60).padStart(2, "0")}`}</p><div className="utilities-actions"><button className="primary-button" aria-expanded={playing === t.id} onClick={() => setPlaying(playing === t.id ? null : t.id)}>{playing === t.id ? "Cerrar video" : "Ver tutorial"}</button><button className="secondary-button" disabled={mutation.isPending} aria-pressed={t.favorite} onClick={() => mutation.mutate({ path: `/tutorials/${t.id}/progress`, body: { favorite: !t.favorite } })}>{t.favorite ? "Quitar favorito" : "Guardar favorito"}</button><button className="secondary-button" disabled={mutation.isPending} onClick={() => mutation.mutate({ path: `/tutorials/${t.id}/progress`, body: { completed: !t.completed } })}>{t.completed ? "Marcar pendiente" : "Marcar como visto"}</button></div>
          {playing === t.id ? <TutorialPlayer tutorial={t} /> : null}{t.transcript ? <details><summary>Leer transcripción</summary><p className="utilities-prose">{t.transcript}</p></details> : null}{t.tool_path ? <Link className="secondary-button" to={t.tool_path}>Abrir herramienta y practicar</Link> : null}
        </article>)}<div className="utilities-actions"><button className="secondary-button" disabled={page === 1} onClick={() => setPage(p => p-1)}>Anterior</button><span>Página {page}</span><button className="secondary-button" disabled={page*12 >= query.data.total} onClick={() => setPage(p => p+1)}>Siguiente</button></div>
      </>}
    </section>
  </main>;
}

function TutorialPlayer({ tutorial }: { tutorial: Tutorial }) {
  const lastSaved = useRef(0);
  const [error, setError] = useState("");
  const client = useQueryClient();
  const save = async (video: HTMLVideoElement, completed = false) => {
    try { await utilityApi(`/tutorials/${tutorial.id}/progress`, "PUT", { seconds: Math.floor(video.currentTime), ...(completed ? { completed: true } : {}) }); setError(""); await client.invalidateQueries({ queryKey: utilityKey("tutorials") }); } catch (e) { setError(errorText(e)); }
  };
  const url = new URL(tutorial.url);
  const youtube = ["youtube.com", "www.youtube.com", "youtu.be"].includes(url.hostname);
  const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v") ?? url.pathname.split("/").pop();
  return <div>{youtube ? <><iframe className="utilities-video" title={tutorial.title} src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id ?? "")}?start=${tutorial.seconds}`} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><small>Video externo: usa «Marcar como visto» al terminar. El avance automático está disponible para MP4 y WebM.</small></> : <video className="utilities-video" src={tutorial.url} controls preload="metadata" onLoadedMetadata={e => { e.currentTarget.currentTime = Math.min(tutorial.seconds, e.currentTarget.duration || tutorial.seconds); }} onTimeUpdate={e => { if (Date.now()-lastSaved.current > 15000) { lastSaved.current = Date.now(); void save(e.currentTarget); } }} onPause={e => void save(e.currentTarget)} onEnded={e => void save(e.currentTarget, true)} onError={() => setError("No se pudo reproducir el video. Revisa la conexión o la dirección del archivo.")} />}{error ? <p role="alert">{error}</p> : null}</div>;
}
