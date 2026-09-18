/**
 * Moderación de contenido de la comunidad, dentro del área de administración.
 *
 * Antes estos formularios vivían incrustados en las páginas del docente
 * (`/dashboard/ideas`, `/dashboard/comunidad-activa`, `/dashboard/videos-tutorial`
 * y `/dashboard/referidos`) detrás de un `role === "admin"`. Ahora el espacio
 * docente solo contiene lo que usa el docente y la administración vive bajo
 * `/admin`, con su propio menú y su propio guard de ruta.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { errorText, utilityApi, utilityKey, type Page } from "../utilities/api";
import "../utilities/utilities.css";

const IDEA_STATES: Record<string, string> = {
  received: "Recibida", review: "En revisión", planned: "Planificada", development: "En desarrollo",
  published: "Publicada", resolved: "Resuelta", declined: "No priorizada", hidden: "Oculta",
};

type Idea = { id: string; title: string; description: string; status: string; response: string };
type Post = { id: string; title: string; content: string; author: string };
type Tutorial = {
  id: string; title: string; description: string; url: string; category: string; difficulty: string;
  tool_path: string; transcript: string; published: boolean; position: number;
};
type Referral = { id: string; reward: number; invitee_id: string; referrer_id: string };
type ReferralSettings = { enabled: boolean; reward: number };

/** Mutación que revalida la lista indicada al terminar. */
function useAdminMutation(key: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ path, method, body }: { path: string; method: string; body?: unknown }) => utilityApi(path, method, body),
    onSuccess: () => client.invalidateQueries({ queryKey: utilityKey(key) }),
  });
}

function Pager({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (page: number) => void }) {
  return (
    <div className="utilities-actions">
      <button className="secondary-button" disabled={page === 1} onClick={() => onChange(page - 1)}>Anterior</button>
      <span>Página {page}</span>
      <button className="secondary-button" disabled={page * perPage >= total} onClick={() => onChange(page + 1)}>Siguiente</button>
    </div>
  );
}

function IdeasModeration() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: utilityKey("admin-ideas", page),
    queryFn: ({ signal }) => utilityApi<Page<Idea>>(`/ideas?page=${page}`, "GET", undefined, signal),
  });
  const mutation = useAdminMutation("admin-ideas");
  return (
    <section className="utility-panel">
      <h2>Ideas y mejoras</h2>
      <p>Cambia el estado de una propuesta y responde al docente que la envió.</p>
      {query.isPending ? <p role="status">Cargando propuestas…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : (
        <>
          {query.data.items.map((idea) => (
            <article className="utilities-card" key={idea.id}>
              <small>{IDEA_STATES[idea.status] ?? idea.status}</small>
              <h3>{idea.title}</h3>
              <p className="utilities-prose">{idea.description}</p>
              <form className="utilities-form" onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate({ path: `/admin/ideas/${idea.id}`, method: "PATCH", body: Object.fromEntries(new FormData(event.currentTarget)) });
              }}>
                <label>Estado administrativo
                  <select name="status" defaultValue={idea.status}>
                    {Object.entries(IDEA_STATES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </label>
                <label>Respuesta y motivo
                  <textarea name="response" required minLength={4} maxLength={4000} defaultValue={idea.response} />
                </label>
                <button className="secondary-button" disabled={mutation.isPending}>Actualizar y notificar al autor</button>
              </form>
            </article>
          ))}
          {!query.data.items.length ? <p>No hay propuestas registradas.</p> : null}
          <Pager page={page} total={query.data.total} perPage={12} onChange={setPage} />
        </>
      )}
      {mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}
    </section>
  );
}

function CommunityModeration() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: utilityKey("admin-community", page),
    queryFn: ({ signal }) => utilityApi<Page<Post>>(`/community/feed?page=${page}`, "GET", undefined, signal),
  });
  const mutation = useAdminMutation("admin-community");
  return (
    <section className="utility-panel">
      <h2>Comunidad activa</h2>
      <p>Retira un aporte dejando registrado el motivo en la auditoría.</p>
      {query.isPending ? <p role="status">Cargando aportes…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : (
        <>
          {query.data.items.map((post) => (
            <article className="utilities-card" key={post.id}>
              <small>{post.author}</small>
              <h3>{post.title}</h3>
              <p className="utilities-prose">{post.content}</p>
              <form className="utilities-form" onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate({
                  path: `/admin/community/${post.id}`,
                  method: "PATCH",
                  body: { status: "hidden", reason: new FormData(event.currentTarget).get("reason") },
                });
              }}>
                <label>Motivo de moderación
                  <input name="reason" required minLength={4} maxLength={500} placeholder="Explica por qué se retira este aporte" />
                </label>
                <button className="secondary-button" disabled={mutation.isPending}>Ocultar con registro de auditoría</button>
              </form>
            </article>
          ))}
          {!query.data.items.length ? <p>No hay aportes publicados.</p> : null}
          <Pager page={page} total={query.data.total} perPage={12} onChange={setPage} />
        </>
      )}
      {mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}
    </section>
  );
}

function TutorialsModeration() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Tutorial | null>(null);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const query = useQuery({
    queryKey: utilityKey("admin-tutorials", page),
    queryFn: ({ signal }) => utilityApi<Page<Tutorial>>(`/tutorials?page=${page}`, "GET", undefined, signal),
  });
  const mutation = useAdminMutation("admin-tutorials");
  return (
    <section className="utility-panel">
      <h2>Videos tutoriales</h2>
      <form key={editing?.id ?? "new"} className="utilities-form" onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const body = {
          ...Object.fromEntries(data),
          ...(editing ? {} : { request_id: requestId }),
          position: Number(data.get("position")),
          published: data.has("published"),
        };
        try {
          await mutation.mutateAsync({ path: editing ? `/admin/tutorials/${editing.id}` : "/admin/tutorials", method: editing ? "PUT" : "POST", body });
          setEditing(null);
          setRequestId(crypto.randomUUID());
          form.reset();
        } catch { /* El error se muestra abajo y se conserva lo escrito. */ }
      }}>
        <h3>{editing ? "Editar tutorial" : "Publicar un tutorial"}</h3>
        <label>Título<input name="title" required minLength={4} maxLength={180} defaultValue={editing?.title} /></label>
        <label>Descripción<textarea name="description" maxLength={4000} defaultValue={editing?.description} /></label>
        <label>URL del video<input type="url" name="url" required defaultValue={editing?.url} placeholder="https://… (MP4, WebM o YouTube)" /></label>
        <div className="utilities-grid">
          <label>Categoría<input name="category" required minLength={2} maxLength={80} defaultValue={editing?.category} placeholder="Ej. Planificación" /></label>
          <label>Dificultad
            <select name="difficulty" defaultValue={editing?.difficulty}>
              <option value="inicial">Inicial</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option>
            </select>
          </label>
          <label>Orden<input name="position" type="number" min={0} max={10000} defaultValue={editing?.position ?? 0} /></label>
        </div>
        <label>Ruta de herramienta (opcional)<input name="tool_path" defaultValue={editing?.tool_path} placeholder="/dashboard/planificamos/plan-curricular-anual" /></label>
        <label>Transcripción<textarea name="transcript" rows={5} defaultValue={editing?.transcript} maxLength={50000} /></label>
        <label className="utilities-check"><input type="checkbox" name="published" defaultChecked={editing?.published} />Publicado y visible para docentes</label>
        <div className="utilities-actions">
          <button className="primary-button" disabled={mutation.isPending}>Guardar tutorial</button>
          {editing ? <button className="secondary-button" type="button" onClick={() => setEditing(null)}>Cancelar</button> : null}
        </div>
      </form>
      {mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}
      {query.isPending ? <p role="status">Cargando biblioteca…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : (
        <>
          {query.data.items.map((tutorial) => (
            <article className="utilities-card" key={tutorial.id}>
              <small>{tutorial.category} · {tutorial.difficulty} · {tutorial.published ? "Publicado" : "Borrador"}</small>
              <h3>{tutorial.title}</h3>
              <p>{tutorial.description}</p>
              <div className="utilities-actions">
                <button className="secondary-button" onClick={() => { setEditing(tutorial); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar / retirar</button>
              </div>
            </article>
          ))}
          {!query.data.items.length ? <p>Aún no hay tutoriales.</p> : null}
          <Pager page={page} total={query.data.total} perPage={12} onChange={setPage} />
        </>
      )}
    </section>
  );
}

function ReferralsModeration() {
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const settings = useQuery({
    queryKey: utilityKey("admin-referral-settings"),
    queryFn: ({ signal }) => utilityApi<{ settings: ReferralSettings }>("/referrals/me?page=1", "GET", undefined, signal),
  });
  const pending = useQuery({
    queryKey: utilityKey("admin-referral-review", page),
    queryFn: ({ signal }) => utilityApi<Page<Referral>>(`/admin/referrals?page=${page}`, "GET", undefined, signal),
  });
  const mutation = useMutation({
    mutationFn: ({ path, body, method = "POST" }: { path: string; body: unknown; method?: string }) => utilityApi(path, method, body),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: utilityKey("admin-referral-settings") }),
        client.invalidateQueries({ queryKey: utilityKey("admin-referral-review") }),
      ]);
      window.dispatchEvent(new Event("avendia-credits-updated"));
    },
  });
  return (
    <section className="utility-panel">
      <h2>Programa de referidos</h2>
      {settings.data ? (
        <form className="utilities-form" onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          mutation.mutate({ path: "/admin/referrals/settings", method: "PUT", body: { enabled: form.has("enabled"), reward: Number(form.get("reward")) } });
        }}>
          <label className="utilities-check"><input type="checkbox" name="enabled" defaultChecked={settings.data.settings.enabled} />Programa activo</label>
          <label>Créditos para futuras invitaciones
            <input name="reward" type="number" min={0} max={100000} defaultValue={settings.data.settings.reward} required />
          </label>
          <button className="secondary-button" disabled={mutation.isPending}>Guardar reglas</button>
        </form>
      ) : null}
      {mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}
      <h3>Registros pendientes de validar</h3>
      {pending.isPending ? <p role="status">Cargando…</p> : pending.isError ? <p role="alert">{errorText(pending.error)}</p> : (
        <>
          {pending.data.total === 0 ? <p>No hay invitaciones pendientes.</p> : pending.data.items.map((referral) => (
            <form className="utilities-card utilities-form" key={referral.id} onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({ path: `/admin/referrals/${referral.id}/review`, body: Object.fromEntries(new FormData(event.currentTarget)) });
            }}>
              <p>Invitación {referral.id.slice(0, 8)} · {referral.reward} créditos</p>
              <small>Cuenta referente: {referral.referrer_id}<br />Cuenta invitada: {referral.invitee_id}</small>
              <label>Decisión
                <select name="status"><option value="rejected">Rechazar</option><option value="credited">Validar y abonar créditos</option></select>
              </label>
              <label>Motivo visible para el referente
                <input name="reason" minLength={4} maxLength={500} required placeholder="Explica la decisión sin incluir datos personales." />
              </label>
              <button className="secondary-button" disabled={mutation.isPending}>Confirmar revisión</button>
            </form>
          ))}
          <Pager page={page} total={pending.data.total} perPage={20} onChange={setPage} />
        </>
      )}
    </section>
  );
}

export function AdminModerationPage() {
  return (
    <main className="content-page utilities-page">
      <h1>Moderación y contenido</h1>
      <p>Ideas, comunidad, tutoriales y referidos. Los docentes no ven estos controles en su espacio.</p>
      <IdeasModeration />
      <CommunityModeration />
      <TutorialsModeration />
      <ReferralsModeration />
    </main>
  );
}
