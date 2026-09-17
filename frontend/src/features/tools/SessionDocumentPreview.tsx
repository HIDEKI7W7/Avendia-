import { useState } from "react";
import { Download, FileText, LayoutGrid, Printer } from "lucide-react";

import { assetDataUrl, momentAsset, WORKSHEET_ASSETS } from "./docx/images";
import { readSessionContent, type SessionContent } from "./docx/sessionContent";
import { useYearMotto } from "./docx/motto";
import type { WorkflowArtifact } from "./exportWorkflowDocx";
import "../../styles/word-preview.css";

type Props = {
  artifact: WorkflowArtifact;
  values: Record<string, unknown>;
  onDownloadWord?: () => void;
  editingResult?: boolean;
  onUpdateSection?: (index: number, key: "title" | "narrative", value: string) => void;
  onUpdateTableCell?: (tableIndex: number, rowIndex: number, cellIndex: number, value: string) => void;
  /** "materials" muestra solo los anexos para el estudiante (teoría, ficha y mapa mental). */
  part?: "full" | "materials";
};

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
const MOMENT_CLASS: Record<string, string> = { inicio: "is-inicio", desarrollo: "is-desarrollo", cierre: "is-cierre" };

function momentClass(name: string) {
  const key = name.toLocaleLowerCase("es");
  return MOMENT_CLASS[Object.keys(MOMENT_CLASS).find((item) => key.includes(item)) ?? "desarrollo"];
}

/** Texto multilínea con viñetas ✓ y etiquetas en negrita, igual que las celdas del Word. */
export function CellText({ text, check = false }: { text: string; check?: boolean }) {
  const lines = String(text ?? "").replace(/\s+[•▪●]\s+/g, "\n• ").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return <span className="word-cell-empty">&nbsp;</span>;
  return (
    <>
      {lines.map((line, index) => {
        const isBullet = /^[-•▪●✓✔]\s+/.test(line);
        const body = line.replace(/^[-•▪●✓✔]\s+/, "");
        const match = body.match(/^([^:]{2,60}):\s+(.*)$/);
        const content = match && match[1].split(/\s+/).length <= 4
          ? <><strong>{match[1]}:</strong> {match[2]}</>
          : body;
        return (
          <p key={`${index}-${line.slice(0, 16)}`} className={isBullet || check ? "word-cell-line word-cell-line--check" : "word-cell-line"}>
            {isBullet || check ? <span className="word-check">✓</span> : null}
            <span>{content}</span>
          </p>
        );
      })}
    </>
  );
}

function ChromeHeader({ right }: { right: string }) {
  const motto = useYearMotto();
  return (
    <div className="word-chrome-header">
      <img src={assetDataUrl("minedu")} alt="Ministerio de Educación del Perú" className="word-chrome-logo" />
      <div className="word-chrome-right">
        {motto ? <span className="word-chrome-motto">{motto}</span> : null}
        {right ? <span className="word-chrome-line">{right}</span> : null}
      </div>
    </div>
  );
}

function Band({ children, tone = "band", center = false }: { children: React.ReactNode; tone?: "band" | "deep" | "navy" | "teal"; center?: boolean }) {
  return <h2 className={`word-band word-band--${tone} ${center ? "is-center" : ""}`}>{children}</h2>;
}

function Moments({ content }: { content: SessionContent }) {
  return (
    <table className="word-table word-moments">
      <tbody>
        {content.moments.map((moment, index) => {
          const image = <td className="word-moments__image"><img src={assetDataUrl(momentAsset(moment.name))} alt={moment.name} /></td>;
          const body = (
            <td className="word-moments__body">
              <CellText text={[moment.teacher, moment.student && moment.student !== moment.teacher ? `Acciones del estudiante: ${moment.student}` : "", moment.evidence ? `Evidencia y retroalimentación: ${moment.evidence}` : ""].filter(Boolean).join("\n") || "________________"} />
            </td>
          );
          return (
            <tr key={`${moment.name}-${index}`}>
              <td className={`word-moments__label ${momentClass(moment.name)}`}>
                <strong>{moment.name.toLocaleUpperCase("es")}</strong>
                {moment.minutes ? <small>{moment.minutes}</small> : null}
              </td>
              {index % 2 === 1 ? <>{image}{body}</> : <>{body}{image}</>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Worksheet({ content }: { content: SessionContent }) {
  const grade = content.info.find(([label]) => label === "Grado")?.[1] ?? "________";
  return (
    <section className="word-section word-page-break">
      <Band tone="navy" center>Ficha de trabajo</Band>
      <p className="word-worksheet-title">¡{content.title}!</p>
      <div className="word-worksheet-id">Nombre y apellidos: ______________________________ &nbsp; Grado: {grade} &nbsp; Fecha: ____ / ____ / ______</div>
      <div className="word-worksheet-intro">
        <img src={assetDataUrl(WORKSHEET_ASSETS[0])} alt="" />
        <p>📌 Lee con atención y responde las preguntas basándote en lo aprendido sobre {content.mindMap.center.toLocaleLowerCase("es")}.</p>
      </div>
      {content.worksheet.map((item, index) => {
        const type = item.type.toLocaleLowerCase("es");
        return (
          <article key={`${item.number}-${index}`} className={`word-card word-card--${index % 5}`}>
            <p className="word-card__prompt"><span className="word-card__number">{CIRCLED[index] ?? `${index + 1}.`}</span> {item.prompt}</p>
            {item.options.length ? (
              <ol className="word-card__options" type="a">{item.options.map((option, position) => <li key={position}>{option.replace(/^[a-d]\)\s*/i, "")}</li>)}</ol>
            ) : /verdadero|falso/.test(type) ? (
              <p className="word-card__choice">☐ Verdadero &nbsp;&nbsp; ☐ Falso</p>
            ) : /completar/.test(type) ? (
              <p className="word-card__line">Respuesta: ______________________________</p>
            ) : /dibuj|esquema|organizador/.test(type) ? (
              <div className="word-response-box" aria-label="Espacio para el dibujo" />
            ) : (
              <div className="word-answer-lines">{Array.from({ length: /desarrollo|explica|argument/.test(type) ? 4 : 2 }, (_, line) => <div key={line} className="word-answer-line" />)}</div>
            )}
          </article>
        );
      })}
      <h3 className="word-section-h2">Elabora tu {content.alignment.product ? content.alignment.product.toLocaleLowerCase("es") : "organizador visual"}</h3>
      <div className="word-response-box word-response-box--tall" aria-label="Espacio para el organizador" />
      <p className="word-worksheet-self">Marca con una X según cómo realizaste tu trabajo.</p>
      <table className="word-table word-self-assessment">
        <thead>
          <tr><th>Lo que aprendí a hacer</th><th className="is-inicio">Lo logré</th><th className="is-desarrollo">En proceso</th><th className="is-cierre">Necesito ayuda</th></tr>
        </thead>
        <tbody>
          {content.selfAssessment.map((item, index) => <tr key={`${index}-${item.slice(0, 12)}`}><td>{item}</td><td /><td /><td /></tr>)}
        </tbody>
      </table>
    </section>
  );
}

function TheoryBlock({ content }: { content: SessionContent }) {
  return (
    <section className="word-section word-page-break">
      <Band tone="deep">Teoría del tema</Band>
      {content.theory.map((block, index) => (
        <div key={`${index}-${block.title}`}>
          <h3 className="word-section-h2 is-deep">{block.title}</h3>
          <CellText text={block.narrative} />
          {block.points.map((point, position) => <p key={position} className="word-cell-line word-cell-line--check"><span className="word-check is-deep">–</span><span>{point}</span></p>)}
        </div>
      ))}
    </section>
  );
}

function MindMapBlock({ content }: { content: SessionContent }) {
  if (!content.mindMap.branches.length) return null;
  return (
    <section className="word-section word-page-break">
      <Band tone="navy" center>Mapa mental · Infografía</Band>
      <p className="word-mindmap__meta">{content.headerLine}</p>
      <div className="word-mindmap__center">{content.mindMap.center.toLocaleUpperCase("es")}</div>
      <div className="word-mindmap__arrow">▼</div>
      <div className="word-mindmap__branches">
        {content.mindMap.branches.map((branch, index) => (
          <div key={`${index}-${branch.title}`} className={`word-mindmap__branch word-card--${index % 5}`}>
            <div className="word-mindmap__branch-title">{branch.title}</div>
            <ul>{branch.items.map((item, position) => <li key={position}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function MaterialsBody({ content }: { content: SessionContent }) {
  return (
    <>
      <header className="word-paper-header word-paper-header--session">
        <h1 className="word-paper-title">Materiales de la sesión</h1>
        <p className="word-paper-subtitle word-paper-subtitle--session">“{content.title}”</p>
      </header>
      {content.theory.length ? <TheoryBlock content={content} /> : null}
      {content.worksheet.length ? <Worksheet content={content} /> : null}
      <MindMapBlock content={content} />
    </>
  );
}

export function SessionDocumentPreview({ artifact, values, onDownloadWord, editingResult = false, onUpdateSection, part = "full" }: Props) {
  const [viewMode, setViewMode] = useState<"word" | "grid">("word");
  const content = readSessionContent(artifact, values);
  const number = content.sessionNumber ? `N° ${content.sessionNumber.padStart(2, "0")}` : "N° ____";
  const criteria = content.criteria.slice(0, 5);
  const students = content.students.length ? content.students : Array.from({ length: 10 }, () => "");

  return (
    <div className="word-preview-wrapper">
      <div className="word-preview-toolbar">
        <div className="word-preview-toolbar__status"><FileText size={18} /><span>Sesión generada · formato de referencia · {content.moments.length} momentos · {content.worksheet.length} consignas</span></div>
        <div className="word-preview-toolbar__actions">
          <button type="button" className={`word-preview-btn-toggle ${viewMode === "word" ? "is-active" : ""}`} onClick={() => setViewMode("word")}><FileText size={15} /><span>Documento</span></button>
          <button type="button" className={`word-preview-btn-toggle ${viewMode === "grid" ? "is-active" : ""}`} onClick={() => setViewMode("grid")}><LayoutGrid size={15} /><span>Secciones</span></button>
          {onDownloadWord ? <button type="button" className="word-preview-btn-toggle" onClick={onDownloadWord}><Download size={15} /><span>Descargar Word</span></button> : null}
          <button type="button" className="word-preview-btn-toggle" onClick={() => window.print()}><Printer size={15} /><span>Imprimir / PDF</span></button>
        </div>
      </div>

      {viewMode === "word" ? (
        <div className="word-preview-viewport">
          <article className="word-document-paper word-document-paper--session">
            <ChromeHeader right={content.headerLine} />
            {part === "materials" ? <MaterialsBody content={content} /> : <>
            <header className="word-paper-header word-paper-header--session">
              <h1 className="word-paper-title">Sesión de aprendizaje {number}</h1>
              <p className="word-paper-subtitle word-paper-subtitle--session">“{content.title}”</p>
            </header>

            <section className="word-section">
              <Band>I. Datos informativos</Band>
              <table className="word-table word-kv"><tbody>
                {content.info.map(([label, value]) => <tr key={label}><th scope="row">{label.toLocaleUpperCase("es")}:</th><td>{value}</td></tr>)}
              </tbody></table>
            </section>

            <section className="word-section">
              <Band>II. Propósitos de aprendizaje del CNEB</Band>
              <table className="word-table word-table--session">
                <thead><tr><th>Competencia principal y capacidades</th><th>Desempeños del grado</th><th>Criterios de evaluación</th></tr></thead>
                <tbody>
                  {content.competencies.map((item, index) => (
                    <>
                      {index === 1 ? <tr key="support-head" className="word-row-subhead"><th>Competencia de apoyo</th><th>Capacidades / desempeños</th><th>Criterios</th></tr> : null}
                      <tr key={`${index}-${item.competency.slice(0, 12)}`}>
                        <td><CellText text={item.competency || "________________"} check /></td>
                        <td><CellText text={item.performances || "________________"} check /></td>
                        <td><CellText text={item.criteria || "________________"} check /></td>
                      </tr>
                    </>
                  ))}
                  {content.alignment.standard ? <tr className="is-standard"><th scope="row" className="word-kv__label">Estándar del ciclo<br /><small>(lo que se espera al final del ciclo)</small></th><td colSpan={2} className="word-cell-italic">{content.alignment.standard}</td></tr> : null}
                </tbody>
              </table>
            </section>

            <section className="word-section">
              <Band>III. Alineamiento pedagógico de la sesión</Band>
              <table className="word-table word-table--session">
                <thead><tr><th>Propósito</th><th>Reto y situación significativa</th><th>Evidencia</th></tr></thead>
                <tbody>
                  <tr>
                    <td><CellText text={content.alignment.purpose || "¿Qué?\n¿Cómo?\n¿Para qué?"} /></td>
                    <td><CellText text={content.alignment.challenge || "________________"} /></td>
                    <td><CellText text={content.alignment.evidence || "________________"} /></td>
                  </tr>
                  <tr className="is-product"><th scope="row" className="word-kv__label">Producto</th><td colSpan={2}><strong>{content.alignment.product || content.alignment.evidence || "________________"}</strong></td></tr>
                </tbody>
              </table>
            </section>

            <section className="word-section">
              <table className="word-table word-labeled word-labeled--deep"><tbody>
                <tr><th scope="row">Necesidades de aprendizaje</th><td><CellText text={content.needs || "________________"} check /></td></tr>
                <tr><th scope="row">Instrumento de evaluación</th><td>{content.instrument}</td></tr>
              </tbody></table>
            </section>

            <section className="word-section">
              <Band>IV. Competencias transversales</Band>
              <table className="word-table word-table--session word-transversal">
                <thead><tr><th>Competencias y capacidades</th><th>Estándar</th><th>Desempeños</th><th>Criterios</th><th>Evidencia</th></tr></thead>
                <tbody>
                  {content.transversal.map((item) => (
                    <tr key={item.competency}>
                      <td><p className="word-cell-line word-cell-line--check"><span className="word-check">✓</span><strong>{item.competency}</strong></p><p className="word-transversal__label">CAPACIDADES</p><CellText text={item.capacities} /></td>
                      <td><CellText text={item.standard || "________________"} /></td>
                      <td><CellText text={item.performance || "________________"} /></td>
                      <td><CellText text={item.criteria || "________________"} /></td>
                      <td><CellText text={content.alignment.evidence || "________________"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="word-section">
              <Band>V. Enfoques transversales / Atención a la diversidad / DUA</Band>
              <table className="word-table word-labeled"><tbody>
                {(content.approaches.length ? content.approaches : [{ approach: "Enfoque transversal", value: "", attitude: "" }]).map((item, index) => (
                  <tr key={`${index}-${item.approach}`}>
                    <th scope="row" className="is-teal">{item.approach.replace(/^enfoque\s+(de\s+)?/i, "Enfoque de ")}</th>
                    <td><CellText text={[item.value ? `Valor: ${item.value}` : "", item.attitude ? `Actitud: ${item.attitude}` : ""].filter(Boolean).join("\n") || "________________"} /></td>
                  </tr>
                ))}
                <tr className="is-dua"><th scope="row">Diseño Universal para el Aprendizaje (DUA) / Atención a la diversidad</th><td>{content.duaContext || "________________"}</td></tr>
                <tr className="is-dua"><th scope="row">DUA según contexto</th><td><CellText text={content.dua || "________________"} check /></td></tr>
                <tr><th scope="row">Trabajo entre pares</th><td><CellText text={content.peerWork || "Los estudiantes interactúan de manera colaborativa para movilizar capacidades y resolver el reto de la sesión."} /></td></tr>
              </tbody></table>
            </section>

            <section className="word-section">
              <Band>VI. Procesos pedagógicos y actividades</Band>
              <Moments content={content} />
            </section>

            <section className="word-section">
              <Band>VII. Evaluación de los aprendizajes</Band>
              <table className="word-table word-table--session word-table--navy">
                <thead><tr><th>Criterios de evaluación</th><th>Evidencia</th><th>Instrumento</th></tr></thead>
                <tbody>
                  {content.criteria.slice(0, 6).map((item, index) => <tr key={`${index}-${item.criterion.slice(0, 12)}`}><td><CellText text={item.criterion} check /></td><td>{item.evidence || content.alignment.evidence}</td><td className="word-table-cell-center">{content.instrument}</td></tr>)}
                  {content.feedback ? <tr><th scope="row" className="word-kv__label">Retroalimentación</th><td colSpan={2}><CellText text={content.feedback} /></td></tr> : null}
                </tbody>
              </table>
            </section>

            <section className="word-section">
              <Band>VIII. Soporte pedagógico y fuentes de consulta</Band>
              <table className="word-table word-table--session">
                <thead><tr><th>Referencias</th><th>Recursos</th><th>Materiales</th></tr></thead>
                <tbody><tr><td><CellText text={content.sources.references} /></td><td><CellText text={content.sources.resources} /></td><td><CellText text={content.sources.materials} /></td></tr></tbody>
              </table>
            </section>

            {content.extraSections.map((block, index) => (
              <section key={`${index}-${block.title}`} className="word-section">
                <Band tone="teal">{block.title}</Band>
                <CellText text={block.narrative} />
                {block.points.map((point, position) => <p key={position} className="word-cell-line word-cell-line--check"><span className="word-check">✓</span><span>{point}</span></p>)}
              </section>
            ))}

            {artifact.teacher_recommendations.length ? (
              <section className="word-section word-recommendations">
                <h3 className="word-section-h2 is-muted">Orientaciones para la revisión docente</h3>
                <ul className="word-list">{artifact.teacher_recommendations.map((item, index) => <li key={`${index}-${item.slice(0, 12)}`}>{item}</li>)}</ul>
              </section>
            ) : null}

            <div className="word-signatures-box word-signatures-box--session">
              {content.signers.map((person) => (
                <div key={person.role}>
                  <div className="word-signature-line">_____________________________</div>
                  {person.name ? <div className="word-signature-name">{person.name}</div> : null}
                  <div className="word-signature-role">{person.role.toLocaleUpperCase("es")}</div>
                </div>
              ))}
            </div>

            {content.includeTheory ? (
              <section className="word-section word-page-break">
                <Band tone="deep">Teoría del tema</Band>
                {content.theory.map((block, index) => (
                  <div key={`${index}-${block.title}`}>
                    <h3 className="word-section-h2 is-deep">{block.title}</h3>
                    <CellText text={block.narrative} />
                    {block.points.map((point, position) => <p key={position} className="word-cell-line word-cell-line--check"><span className="word-check is-deep">–</span><span>{point}</span></p>)}
                  </div>
                ))}
              </section>
            ) : null}

            <section className="word-section word-page-break">
              <Band tone="deep">Instrumento de evaluación — {content.instrument}</Band>
              <p className="word-guide-competency">Competencia: {content.competencyLine || "________________"}</p>
              <table className="word-table word-table--deep word-guide">
                <thead><tr><th>N°</th><th>Nombres y apellidos</th>{criteria.map((item, index) => <th key={index}>{item.criterion}</th>)}<th>Observaciones</th></tr></thead>
                <tbody>{students.map((student, index) => <tr key={index}><td className="word-table-cell-center">{index + 1}</td><td>{student}</td>{criteria.map((_, position) => <td key={position} />)}<td /></tr>)}</tbody>
              </table>
              <p className="word-guide-scale"><strong>Escala:</strong> Lo logró (L) · En proceso (P) · Necesita ayuda (A)</p>
            </section>

            {content.includeWorksheet ? <Worksheet content={content} /> : null}

            {content.mindMap.branches.length ? (
              <section className="word-section word-page-break">
                <Band tone="navy" center>Mapa mental · Infografía</Band>
                <p className="word-mindmap__meta">{content.headerLine}</p>
                <div className="word-mindmap__center">{content.mindMap.center.toLocaleUpperCase("es")}</div>
                <div className="word-mindmap__arrow">▼</div>
                <div className="word-mindmap__branches">
                  {content.mindMap.branches.map((branch, index) => (
                    <div key={`${index}-${branch.title}`} className={`word-mindmap__branch word-card--${index % 5}`}>
                      <div className="word-mindmap__branch-title">{branch.title}</div>
                      <ul>{branch.items.map((item, position) => <li key={position}>{item}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            </>}
          </article>
        </div>
      ) : (
        <div className={`workflow-artifact__grid ${editingResult ? "is-editing" : ""}`}>
          {artifact.sections.map((section, index) => (
            <article key={`${section.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {editingResult && onUpdateSection ? <input className="word-inline-title-input" aria-label={`Título de ${section.title}`} value={section.title} onChange={(event) => onUpdateSection(index, "title", event.target.value)} /> : <h2>{section.title}</h2>}
              {editingResult && onUpdateSection ? <textarea className="word-inline-editor" rows={6} aria-label={`Contenido de ${section.title}`} value={section.narrative} onChange={(event) => onUpdateSection(index, "narrative", event.target.value)} /> : <p>{section.narrative}</p>}
              <ul>{section.key_points.map((point, position) => <li key={position}>{point}</li>)}</ul>
            </article>
          ))}
          {(artifact.tables ?? []).map((table, index) => (
            <article key={`${table.title}-${index}`}><span>M{String(index + 1).padStart(2, "0")}</span><h2>{table.title}</h2><p>{table.rows.length} filas · {table.columns.join(" · ")}</p></article>
          ))}
        </div>
      )}
    </div>
  );
}
