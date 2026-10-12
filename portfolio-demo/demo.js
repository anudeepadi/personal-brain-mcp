"use strict";

// Browser port of LocalRetriever in examples/offline_walkthrough.py:
// rank each note by the number of distinct query words it contains.
// No embeddings, no LLM, no network.

const MAX_NOTE_CHARS = 1000; // production chunk_size; keeps the edited note one chunk
const TOP_K = 2;
// Approximates Python's Unicode-aware \w used by the fixture.
const WORD = /[\p{L}\p{M}\p{N}_]+/gu;

const SAMPLE_SOURCES = Object.freeze([
  Object.freeze({
    id: "aurora",
    filename: "aurora-synthetic.txt",
    editable: true,
    text: [
      "Project Aurora — decision log (synthetic)",
      "Decision: weekly planning happens on Tuesday.",
      "Owner: Sam.",
      "Reason: Monday releases left no time to review open questions.",
      "Follow-up: move the retro to Thursday afternoon.",
    ].join("\n"),
  }),
  Object.freeze({
    id: "beacon",
    filename: "beacon-synthetic.txt",
    editable: false,
    text: [
      "Project Beacon — design note (synthetic)",
      "Decision: the release color is amber.",
      "Owner: design team.",
      "Reason: amber stays legible on the dark status board.",
      "Open question: should planning badges use the same color?",
    ].join("\n"),
  }),
]);

let state = { query: "", sources: SAMPLE_SOURCES, editing: null };

const $ = (id) => document.getElementById(id);

function words(text) {
  return text.toLowerCase().match(WORD) || [];
}

function retrieve(query, sources) {
  const terms = [...new Set(words(query))];
  const ranked = sources
    .map((source) => {
      const vocab = new Set(words(source.text));
      return { source, terms, matched: terms.filter((t) => vocab.has(t)) };
    })
    .filter((hit) => hit.matched.length > 0);
  // Array.prototype.sort is stable, so ties keep source order, as in Python.
  return ranked.sort((a, b) => b.matched.length - a.matched.length).slice(0, TOP_K);
}

function bestLine(text, matched) {
  const wanted = new Set(matched);
  return text.split("\n").reduce(
    (best, line, index) => {
      const count = new Set(words(line).filter((w) => wanted.has(w))).size;
      return count > best.count ? { index, line, count } : best;
    },
    { index: -1, line: "", count: 0 },
  );
}

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

// Build text with <mark> around matched words, using text nodes only.
function marked(text, matched) {
  const wanted = new Set(matched);
  const frag = document.createDocumentFragment();
  let last = 0;
  for (const m of text.matchAll(WORD)) {
    if (!wanted.has(m[0].toLowerCase())) continue;
    frag.append(text.slice(last, m.index), el("mark", { textContent: m[0] }));
    last = m.index + m[0].length;
  }
  frag.append(text.slice(last));
  return frag;
}

function lineId(source, index) {
  return `${source.id}-L${index + 1}`;
}

function renderSlip(hit, rank) {
  const { source, terms, matched } = hit;
  const line = bestLine(source.text, matched);
  const missing = terms.filter((t) => !matched.includes(t));
  const cite = `${source.filename} · chunk 0 · line ${line.index + 1}`;

  return el("article", { className: "slip" }, [
    el("header", {}, [
      el("span", { className: "rank", textContent: `#${rank}` }),
      el("h3", { textContent: source.filename }),
    ]),
    el("p", {
      className: "overlap",
      textContent: `Shares ${matched.length} of ${terms.length} query words: ${matched.join(", ")}`
        + (missing.length ? `. Not found: ${missing.join(", ")}` : ""),
    }),
    el("blockquote", {}, [marked(line.line, matched)]),
    el("p", { className: "cite" }, [
      el("span", { className: "cite-label", textContent: "Source " }),
      el("a", { href: `#${lineId(source, line.index)}`, textContent: cite }),
    ]),
  ]);
}

function renderResults() {
  const terms = words(state.query);
  const hits = retrieve(state.query, state.sources);
  const status = $("status");
  const results = $("results");

  if (terms.length === 0) {
    status.textContent = "Enter at least one word to search.";
    results.replaceChildren();
    return [];
  }
  if (hits.length === 0) {
    status.textContent = "No source matched.";
    results.replaceChildren(
      el("div", { className: "empty" }, [
        el("p", { className: "empty-title", textContent: `No note shares a word with “${state.query.trim()}”.` }),
        el("p", {
          textContent: "Word overlap only matches exact words. ContextX's provider path compares "
            + "embeddings instead; that path doesn't run on this page.",
        }),
      ]),
    );
    return [];
  }
  status.textContent = `${hits.length} of ${state.sources.length} sources matched, ranked by shared words.`;
  results.replaceChildren(...hits.map((hit, i) => renderSlip(hit, i + 1)));
  return hits;
}

function renderLines(source, matched) {
  const lines = source.text.split("\n");
  return el("ol", { className: "lines" }, lines.map((line, i) =>
    el("li", { id: lineId(source, i), tabIndex: -1 }, [el("span", {}, [marked(line, matched)])]),
  ));
}

function renderEditor(source) {
  const area = el("textarea", {
    id: `${source.id}-edit`,
    value: source.text,
    maxLength: MAX_NOTE_CHARS,
    rows: 8,
    spellcheck: false,
  });
  const count = el("span", { className: "count", id: `${source.id}-count` });
  const updateCount = () => { count.textContent = `${area.value.length} / ${MAX_NOTE_CHARS} characters`; };
  area.addEventListener("input", updateCount);
  updateCount();
  area.setAttribute("aria-describedby", count.id);

  const form = el("form", { className: "editor" }, [
    el("label", { htmlFor: area.id, textContent: `Edit ${source.filename}` }),
    area,
    count,
    el("div", { className: "editor-actions" }, [
      el("button", { type: "submit", textContent: "Save and rerun" }),
      el("button", { type: "button", className: "quiet", textContent: "Cancel", onclick: () => closeEditor(source.id) }),
    ]),
  ]);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveSource(source.id, area.value);
  });
  return form;
}

function renderSheet(source, matched) {
  const original = SAMPLE_SOURCES.find((s) => s.id === source.id);
  const edited = original && original.text !== source.text;
  const bytes = new TextEncoder().encode(source.text).length;
  const isEditing = state.editing === source.id;

  const actions = source.editable
    ? [
        el("button", {
          type: "button",
          id: `${source.id}-edit-toggle`,
          className: "quiet",
          textContent: isEditing ? "Editing…" : "Edit note",
          disabled: isEditing,
          onclick: () => openEditor(source.id),
        }),
        ...(edited ? [el("button", {
          type: "button",
          className: "quiet",
          textContent: "Reset",
          onclick: () => saveSource(source.id, original.text),
        })] : []),
      ]
    : [];

  return el("article", { className: "sheet", id: `src-${source.id}` }, [
    el("header", { className: "sheet-head" }, [
      el("h3", { textContent: source.filename }),
      el("p", {
        className: "meta",
        textContent: `text/plain · ${bytes} bytes · chunk 0${edited ? " · edited" : ""}`,
      }),
      el("div", { className: "sheet-actions" }, actions),
    ]),
    renderLines(source, matched),
    ...(isEditing ? [renderEditor(source)] : []),
  ]);
}

function renderSources(hits) {
  const matchedFor = (id) => (hits.find((h) => h.source.id === id) || { matched: [] }).matched;
  $("source-list").replaceChildren(...state.sources.map((s) => renderSheet(s, matchedFor(s.id))));
}

function render() {
  renderSources(renderResults());
}

function runQuery(query) {
  state = { ...state, query };
  render();
}

function openEditor(id) {
  state = { ...state, editing: id };
  render();
  $(`${id}-edit`).focus();
}

function closeEditor(id) {
  state = { ...state, editing: null };
  render();
  $(`${id}-edit-toggle`).focus();
}

function saveSource(id, text) {
  const clipped = text.slice(0, MAX_NOTE_CHARS);
  state = {
    ...state,
    sources: state.sources.map((s) => (s.id === id ? { ...s, text: clipped } : s)),
  };
  closeEditor(id);
}

document.addEventListener("DOMContentLoaded", () => {
  const input = $("query");
  $("query-form").addEventListener("submit", (event) => {
    event.preventDefault();
    runQuery(input.value);
  });
  document.querySelectorAll("[data-query]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.query;
      runQuery(input.value);
    });
  });
  runQuery(input.value);
});
