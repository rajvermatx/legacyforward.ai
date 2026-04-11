---
title: "Document Processing"
slug: "document-processing"
description: "Automated document ingestion and structured extraction at scale. Parse PDFs, images, and raw text
    into clean data, then use LLMs to summarize, classify, and extract structured entities — producing
    reliable JSON output ready for downstream databases and APIs."
section: "genai-arch"
order: 4
badges:
  - "PDF & OCR Parsing"
  - "Structured Output"
  - "Multimodal Extraction"
  - "Batch Processing"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/genai-arch/04-document-processing.ipynb"
---

## 1. Architecture Overview

The **Document Processing** architecture automates the extraction of structured information from unstructured documents. It combines traditional parsing tools (PDF libraries, OCR engines) with LLM-powered extraction to convert messy real-world documents into clean, typed data structures.

This pattern is essential for any business that processes invoices, contracts, resumes, medical records, legal filings, or research papers at scale. The key insight is that LLMs excel at understanding document *semantics*, while traditional tools handle document *mechanics* (rendering, OCR, layout).

### When to Use

-   Invoice and receipt processing (extract line items, totals, vendor info)
-   Contract analysis (identify clauses, obligations, dates, parties)
-   Resume parsing (extract skills, experience, education into structured profiles)
-   Medical record extraction (diagnoses, medications, lab results)
-   Compliance document review (flag missing sections, policy violations)
-   Batch processing of document backlogs for data migration

### Complexity Level

**Moderate to High.** The parsing layer requires handling diverse document formats, OCR quality issues, and layout variations. The LLM extraction layer requires careful schema design and output validation. Error handling is critical because real-world documents are messy.

>**Tip:** For documents with complex tables and layouts, consider multimodal models (send page images directly) rather than trying to extract text first. Vision models often handle formatting that text extraction completely mangles.

## 2. Architecture Diagram

![Diagram 1](/diagrams/genai-arch/document-processing-1.svg)

Architecture diagram — Document Processing: parse, chunk, extract, and store structured data

## 3. Components Deep Dive

### Document Parsing Libraries

| Library | Format | Strengths | Limitations |
| --- | --- | --- | --- |
| **PyPDF2 / pypdf** | PDF (text) | Fast, lightweight, no dependencies | No OCR, poor with scanned PDFs |
| **pdfplumber** | PDF (tables) | Excellent table extraction | Slower, text-layer PDFs only |
| **Unstructured** | All formats | Unified API, layout detection | Heavy dependency tree |
| **Tesseract** | Images/scans | Free, widely supported OCR | Quality varies, needs preprocessing |
| **Google Document AI** | All formats | Best-in-class OCR + layout | Cloud-only, costs per page |
| **Amazon Textract** | All formats | Table + form extraction | AWS-only, pricing per page |

📄

#### PDF Parsing

Start with PyPDF2 for text-layer PDFs. Use pdfplumber for table-heavy docs. Fall back to OCR (Tesseract or Document AI) for scanned documents. Always check if the PDF has a text layer first.

📷

#### Multimodal Extraction

Send page images directly to vision-capable models (GPT-4V, Claude 3) for complex layouts. Bypasses OCR entirely. Especially powerful for forms, receipts, and handwritten documents.

📋

#### Structured Output

Use JSON mode or Pydantic models to enforce schema. Define expected fields, types, and validation rules upfront. Retry with error feedback when output doesn't match schema.

⚙

#### Batch Processing

Process documents in parallel with async/await or job queues (Celery, Bull). Implement progress tracking, error recovery, and partial result storage for large batches.

⚠

#### Error Handling

Documents fail in surprising ways: corrupted PDFs, password-protected files, unsupported encodings, empty pages. Build robust fallback chains and quarantine problematic files.

🔐

#### Data Validation

Validate extracted data against business rules: required fields present, dates are valid, amounts sum correctly, cross-reference entities. Flag low-confidence extractions for human review.

>**Multimodal vs. OCR Pipeline:** For high-volume, simple documents (receipts, invoices), OCR + text extraction is cheaper. For complex, variable layouts (contracts, medical forms), multimodal models are more accurate and require less engineering. Calculate cost per page for your volume.

## 4. Implementation

### Step 1: Parse a PDF Document

```
import pdfplumber
from pathlib import Path

def parse_pdf(file_path: str) -> list[dict]:
    """Extract text and tables from a PDF, page by page."""
    pages = []
    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            tables = page.extract_tables() or []

            # Convert tables to structured format
            parsed_tables = []
            for table in tables:
                if table and len(table) > 1:
                    headers = [h.strip() if h else "" for h in table[0]]
                    rows = [
                        dict(zip(headers, row))
                        for row in table[1:]
                    ]
                    parsed_tables.append(rows)

            pages.append({
                "page": i + 1,
                "text": text,
                "tables": parsed_tables,
                "has_content": bool(text.strip()),
            })
    return pages
```

### Step 2: Define Extraction Schema with Pydantic

```
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class LineItem(BaseModel):
    description: str = Field(..., description="Item description")
    quantity: int = Field(..., ge=1)
    unit_price: float = Field(..., ge=0)
    total: float = Field(..., ge=0)

class Invoice(BaseModel):
    invoice_number: str
    vendor_name: str
    invoice_date: date
    due_date: Optional[date] = None
    line_items: list[LineItem]
    subtotal: float
    tax: float = 0.0
    total: float
    currency: str = "USD"
    confidence: float = Field(..., ge=0, le=1, description="Extraction confidence")
```

### Step 3: LLM Extraction with Structured Output

```
import anthropic
import json

client = anthropic.Anthropic()

def extract_invoice(document_text: str) -> Invoice:
    """Extract structured invoice data using LLM."""
    schema_json = json.dumps(Invoice.model_json_schema(), indent=2)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system=f"""You are a document extraction specialist.
Extract invoice data from the provided text and return valid JSON
matching this exact schema:

{schema_json}

Rules:
- Extract ALL line items found in the document
- Use ISO 8601 date format (YYYY-MM-DD)
- Set confidence between 0 and 1 based on extraction certainty
- If a field is unclear, make your best guess and lower confidence
- Return ONLY valid JSON, no markdown or explanation""",
        messages=[{
            "role": "user",
            "content": f"Extract invoice data:\n\n{document_text}"
        }],
        temperature=0.0,
    )

    # Parse and validate with Pydantic
    raw = json.loads(response.content[0].text)
    return Invoice.model_validate(raw)
```

### Step 4: Multimodal Extraction (Send Image Directly)

```
import base64

def extract_from_image(image_path: str) -> Invoice:
    """Extract invoice data from an image using vision model."""
    with open(image_path, "rb") as f:
        img_b64 = base64.standard_b64encode(f.read()).decode()

    ext = Path(image_path).suffix.lower()
    media_type = {".png": "image/png", ".jpg": "image/jpeg"}.get(ext, "image/png")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system="Extract invoice data as JSON. Return only valid JSON.",
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": img_b64,
                }},
                {"type": "text", "text": "Extract all invoice data from this image."}
            ]
        }],
        temperature=0.0,
    )

    raw = json.loads(response.content[0].text)
    return Invoice.model_validate(raw)
```

### Step 5: Batch Processing Pipeline

```
import asyncio
from dataclasses import dataclass

@dataclass
class ProcessingResult:
    file_path: str
    status: str  # "success" | "error" | "low_confidence"
    data: Optional[Invoice] = None
    error: Optional[str] = None

async def process_batch(file_paths: list[str], concurrency=5) -> list[ProcessingResult]:
    """Process multiple documents with controlled concurrency."""
    semaphore = asyncio.Semaphore(concurrency)
    results = []

    async def process_one(path):
        async with semaphore:
            try:
                pages = parse_pdf(path)
                text = "\n".join(p["text"] for p in pages if p["has_content"])
                invoice = extract_invoice(text)

                status = "success" if invoice.confidence >= 0.8 else "low_confidence"
                return ProcessingResult(path, status, data=invoice)
            except Exception as e:
                return ProcessingResult(path, "error", error=str(e))

    tasks = [process_one(p) for p in file_paths]
    results = await asyncio.gather(*tasks)
    return results
```

## 5. Data Flow

Step-by-step flow of a document through the processing pipeline:

![Data Flow](/diagrams/genai-arch/document-processing-flow.svg)

| Step | Action | Details |
| --- | --- | --- |
| 1 | Document ingestion | File uploaded via API, watched folder, or S3 event trigger |
| 2 | Format detection | Identify file type (PDF, image, DOCX) and choose appropriate parser |
| 3 | Text extraction | Parse document using best available method (text layer, OCR, or multimodal) |
| 4 | Preprocessing | Clean text, normalize whitespace, detect language, split into sections |
| 5 | LLM extraction | Send cleaned text to LLM with structured output schema (parallel tasks possible) |
| 6 | Validation | Validate extracted data against Pydantic schema and business rules |
| 7 | Confidence routing | High confidence: auto-approve; Low confidence: human review queue |
| 8 | Storage | Write structured JSON to database, archive original document |

## 6. Trade-offs & Considerations

| Advantage | Limitation |
| --- | --- |
| Handles diverse, unstructured document formats | OCR quality varies significantly with document quality |
| LLMs understand document semantics beyond keyword matching | Cost per document can be high for multimodal processing |
| Structured output enforces consistent data schemas | Complex tables and nested layouts still challenge LLMs |
| Scales with batch processing and job queues | Latency per document (seconds to minutes with OCR + LLM) |
| Confidence scoring enables human-in-the-loop review | Sensitive documents (medical, legal) need compliance review |

### Parsing Approach Comparison

| Approach | Cost | Accuracy | Speed | Best For |
| --- | --- | --- | --- | --- |
| **Text extraction only** | Free | Medium | Fast | Clean, text-layer PDFs |
| **OCR + Text LLM** | Low | High | Medium | Scanned docs, standard layouts |
| **Multimodal (image to LLM)** | High | Highest | Slow | Complex layouts, handwriting |
| **Document AI (managed)** | Medium | High | Medium | High volume, standard forms |

>**When to upgrade:** If you need to answer questions over processed documents, feed the extracted data into Architecture 03 (RAG Pipeline). If processing requires multiple tool calls and decision-making, consider Architecture 06 (Agentic Tool Use).

## 7. Production Checklist

-   Build fallback chain: text extraction → OCR → multimodal for each document
-   Validate Pydantic schemas with edge cases (empty fields, unusual formats)
-   Implement confidence thresholds and human review queue for low-confidence extractions
-   Set up dead letter queue for persistently failing documents
-   Monitor extraction accuracy with labeled test sets (precision, recall per field)
-   Handle PII: mask or encrypt sensitive fields (SSN, credit cards) before storage
-   Implement idempotent processing (reprocessing same document produces same result)
-   Add progress tracking and estimated completion time for batch jobs
-   Archive original documents alongside extracted data for audit trails
-   Set cost alerts for multimodal processing (track per-page and per-document costs)
-   Test with adversarial documents (rotated pages, mixed languages, watermarks)
