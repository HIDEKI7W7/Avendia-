/**
 * Selector del documento de origen de la secuencia curricular, compartido por
 * todas las herramientas: el docente elige si parte de su plan anual o de una
 * unidad, y cuando elige unidad puede acotarla en cascada por el plan al que
 * pertenece.
 *
 * Las unidades de un plan se resuelven con las relaciones guardadas en el
 * servidor (`/documents/{id}/relations`), no por coincidencia de campos.
 */
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../lib/api";
import { readAccessToken } from "../lib/session";
import {
  type CurricularReference,
  type ReferenceMode,
  type ReferenceRelation,
  type ReferenceSelection,
  referenceLabel,
} from "../lib/curricularReference";
import "../styles/curricular-reference.css";

type Props = {
  references: CurricularReference[];
  selection: ReferenceSelection;
  onChange: (selection: ReferenceSelection) => void;
  /** Texto de ayuda bajo el selector; cada herramienta explica qué hereda. */
  help?: string;
};

export function CurricularReferencePicker({ references, selection, onChange, help }: Props) {
  const plans = useMemo(() => references.filter((item) => item.kind === "plan-curricular-anual"), [references]);
  const units = useMemo(() => references.filter((item) => item.kind === "unidad-aprendizaje"), [references]);
  /**
   * Unidades que cuelgan del plan resuelto. `ids` a `null` significa que la
   * consulta falló y no se puede acotar, así que se muestran todas.
   */
  const [linked, setLinked] = useState<{ planId: string; ids: string[] | null } | null>(null);

  const cascadePlanId = selection.mode === "unidad" ? selection.planId : "";
  const resolved = linked?.planId === cascadePlanId ? linked : null;
  const loading = Boolean(cascadePlanId) && resolved === null;

  useEffect(() => {
    const token = readAccessToken();
    if (!cascadePlanId || !token) return;
    const controller = new AbortController();
    void apiRequest<ReferenceRelation[]>(`/documents/${cascadePlanId}/relations`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((relations) => setLinked({
        planId: cascadePlanId,
        ids: relations
          .filter((relation) => relation.parent_document_id === cascadePlanId)
          .map((relation) => relation.child_document_id),
      }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLinked({ planId: cascadePlanId, ids: null });
      });
    return () => controller.abort();
  }, [cascadePlanId]);

  /** Con plan resuelto, solo sus unidades; mientras se carga o si falló, todas. */
  const visibleUnits = useMemo(() => {
    if (!resolved?.ids) return units;
    const linkedIds = new Set(resolved.ids);
    return units.filter((unit) => linkedIds.has(unit.id));
  }, [resolved, units]);

  if (!plans.length && !units.length) return null;

  const changeMode = (mode: ReferenceMode) => onChange({ mode, planId: "", unitId: "" });

  return (
    <div className="curricular-reference">
      <label>
        <span>Basar este documento en</span>
        <select value={selection.mode} onChange={(event) => changeMode(event.target.value as ReferenceMode)}>
          <option value="">Empezar desde cero</option>
          {plans.length ? <option value="plan">Mi plan curricular anual</option> : null}
          {units.length ? <option value="unidad">Una unidad de aprendizaje</option> : null}
        </select>
      </label>

      {selection.mode === "plan" ? (
        <label>
          <span>Plan curricular anual</span>
          <select value={selection.planId} onChange={(event) => onChange({ ...selection, planId: event.target.value, unitId: "" })}>
            <option value="">Selecciona tu plan anual</option>
            {plans.map((plan) => <option key={plan.id} value={plan.id}>{referenceLabel(plan)}</option>)}
          </select>
        </label>
      ) : null}

      {selection.mode === "unidad" ? (
        <>
          {plans.length ? (
            <label>
              <span>Plan curricular anual (opcional)</span>
              <select value={selection.planId} onChange={(event) => onChange({ ...selection, planId: event.target.value, unitId: "" })}>
                <option value="">Todas mis unidades</option>
                {plans.map((plan) => <option key={plan.id} value={plan.id}>{referenceLabel(plan)}</option>)}
              </select>
              <small>Acota la lista de abajo a las unidades de ese plan.</small>
            </label>
          ) : null}
          <label>
            <span>Unidad de aprendizaje</span>
            <select
              value={selection.unitId}
              disabled={loading || !visibleUnits.length}
              onChange={(event) => onChange({ ...selection, unitId: event.target.value })}
            >
              <option value="">{loading ? "Cargando unidades…" : visibleUnits.length ? "Selecciona la unidad" : "Ese plan aún no tiene unidades guardadas"}</option>
              {visibleUnits.map((unit) => <option key={unit.id} value={unit.id}>{referenceLabel(unit)}</option>)}
            </select>
            {loading ? <small><LoaderCircle className="is-spinning" aria-hidden="true" /> Buscando las unidades del plan…</small> : null}
          </label>
        </>
      ) : null}

      {help && selection.mode ? <small className="curricular-reference__help">{help}</small> : null}
    </div>
  );
}
