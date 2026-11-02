# Local measure research brief (November 1, 2026)

You are filling in missing facts for local ballot measures in a nonpartisan California voter guide for the November 3, 2026 election. Accuracy beats coverage. A blank field is fine. An invented, guessed or paraphrased-beyond-the-source fact is a serious failure. Never recommend a vote.

## Input and output

- Input: `research/2026-11-01/in-<group>.json`, a list of measures with id, jurisdiction, identifier, title, type, threshold, ballot question, existing sources, and any fields already filled.
- Output: `research/2026-11-01/out-<group>.json`, a JSON list, one object per input measure, same order:

```json
{
  "id": "<measure id from input>",
  "officialPages": [ { "title": "<page or PDF title>", "url": "https://...", "publisher": "<county or city office>" } ],
  "fields": {
    "plainEnglish": { "text": "...", "excerpt": "...", "url": "https://...", "location": "Impartial analysis, paragraph 2" },
    "yes":          { ... },
    "no":           { ... },
    "fiscal":       { ... },
    "argFor":       { ... },
    "argAgainst":   { ... },
    "supporters":   { "text": "Names and titles exactly as signed", "excerpt": "...", "url": "...", "location": "Argument in favor, signatures" },
    "opponents":    { ... }
  },
  "notes": "anything a checker should know, e.g. no argument against was printed",
  "notFound": ["fields you looked for and could not support"]
}
```

Leave a field out entirely (and list it in notFound) when you cannot support it.

## Where to look, in order

1. The county Registrar of Voters measure page or PDF for this election (often one PDF per measure with the full text, the impartial analysis by county counsel or the city attorney, the fiscal or tax rate statement, and the arguments and rebuttals with signers). Alameda: acvote.alamedacountyca.gov measure PDFs. Santa Clara: sccvote.santaclaracounty.gov measure pages. San Mateo: smcacre.gov. Contra Costa: contracostavote.gov. Marin: marinvotes.gov. Sonoma, Solano, Napa: county elections sites. San Francisco: sf.gov voter information pamphlet and the Ballot Simplification Committee digests.
2. The city clerk or district page for the measure (resolution, impartial analysis, arguments).
Only official pages. No news, campaign sites or advocacy pages for any field.

## Rules for each field

- `excerpt` is copied character for character from the page or PDF text that the browser returned. Never from memory, a search snippet or a summary. Keep it to the sentence or two that supports the field. It will be re-checked word for word.
- `plainEnglish`: one or two plain sentences on what the measure does, closely following the impartial analysis or the ballot question. No adjectives the source does not use.
- `yes` / `no`: what a Yes and a No vote do, from the impartial analysis or official digest ("A yes vote means ..."). If the source does not say what a No vote does, `no` may be "If you vote no, this change would not be made." only when the analysis describes the change; cite the analysis sentence that describes the change.
- `fiscal`: tax rate, amount, duration, bond size, or cost exactly as the official text states (ballot question, tax rate statement, fiscal analysis). Numbers must appear in the excerpt.
- `argFor` / `argAgainst`: one neutral sentence starting "The argument in favor says" or "The argument against says", restating the argument's main point in its own terms. The excerpt is the sentence that makes that point. If the official materials state that no argument was filed, write "No argument against was filed." with that statement as the excerpt. If you cannot tell, leave it out.
- `supporters` / `opponents`: the signers of the official argument for or against, names and titles exactly as printed, separated by semicolons. Not endorsements from elsewhere.

## Method

Use the Claude desktop app's built-in browser (Chrome is not available). Load its tools in ONE ToolSearch call: `{ query: "mcp__remote-devices__Claude_Browser__", max_results: 64 }`. Open your OWN tab with `preview_start` (url) and pass its `tabId` to every later call; never act on another tab and never call tools without your tabId. Close your tab with `tabs_close` at the end. Other researchers share the same browser pane, so keep to your tab. If a tool says a site is not allowed yet, call `request_access` with that URL and scope "site"; the user pre-approved all official sites. If the browser cannot be reached at all, stop and say so.

Read pages with `get_page_text` or `javascript_tool` (document.body.innerText). Read PDFs with pdf.js in the page, including PDFs whose link does not end in .pdf (DocumentCenter, showpublisheddocument):

```js
const lib=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
const d=await lib.getDocument({data:await (await fetch(location.href)).arrayBuffer()}).promise;
// read d.getPage(i).getTextContent() for each page; return text in chunks of at most 6000 characters
```

Scanned PDFs (no text layer, common for Alameda County measure PDFs): first look for a text version of the same document on the city, district or county page (impartial analysis and arguments are often posted separately as text PDFs or web pages). Only if none exists, you may read the scan with OCR in the page (tesseract.js 5 from cdn.jsdelivr.net/npm/tesseract.js@5.1.1) and then compare each excerpt with a zoomed screenshot of that part of the page image (`computer` action `zoom`). Use an OCR excerpt only if it matches the image word for word, and set `"method": "ocr-checked-against-image"` in that field. Otherwise leave the field out.

Write the output file after every 3 measures. Validate it is JSON before finishing. Do not edit any other file.

Final reply: per measure, which fields you filled; counts; pages you could not read.

## Resuming (November 1, 2026, 23:00)

The first run was cut off by a lost connection. Your output file may already exist with some measures and fields filled.
- Read the existing `out-<group>.json` first. Keep every field already in it unchanged. Fill only fields that are missing, and add entries for measures not yet in it, so the file ends with one entry per input measure in input order.
- Notes in the existing file say which pages were already found and which were scans; use them to skip repeat work.
- Put any helper scripts you write in `/tmp/claude-0/-home-claude/8fdb0247-17d6-5259-ae68-3571e0bb760d/scratchpad/<group>/` (your own folder), never in a shared path.
- If the browser drops again, write the file with everything you have and stop.

## Second pass (November 2, 2026)

Groups `santa-clara-cities`, `santa-clara-districts` and `alameda-3` fill only the fields still missing after the first run. Each input entry has `alreadyFilled` (published, do not repeat or change), `missing` (the fields to look for), and the first run's `previousNotes`, `previousNotFound` and `previousPages`.
- Output `out-<group>.json` holds one entry per input measure with ONLY newly found fields in `fields`. Same format and rules as above.
- Most county PDFs here are scans. First look for text versions on the city, district or county measure page (Santa Clara County: sccvote.santaclaracounty.gov measure pages; cities often post the impartial analysis and arguments as text PDFs or HTML). If none, use OCR and the image check. Before OCR checking, call `resize_window` on your tab to at least 1280 x 900 so the zoomed page image is readable. Every OCR field must carry `"method": "ocr-checked-against-image"` and match the image word for word.
- If a document says no argument was filed, use that statement as the excerpt, as above.
- Work the measures in input order, write the file after every measure, and stop at 14:00 Pacific time on November 2, 2026 even if not finished (write what you have).
