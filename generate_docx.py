import os
import zipfile
import xml.sax.saxutils as xml_escape

def create_docx(filename, title, sections):
    # XML templates for a minimal valid docx
    content_types_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

    rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    document_rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI"/>
        <w:sz w:val="23"/>
        <w:color w:val="0F172A"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>"""

    # Build document.xml body
    body_xml_parts = []
    
    # Title Banner
    body_xml_parts.append(f"""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="120"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="0F766E"/></w:rPr>
        <w:t>{xml_escape.escape(title)}</w:t>
      </w:r>
    </w:p>
    """)

    body_xml_parts.append("""
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="360"/></w:pPr>
      <w:r>
        <w:rPr><w:i/><w:sz w:val="24"/><w:color w:val="475569"/></w:rPr>
        <w:t>Product Requirements & Technical Implementation Report • Version 1.0 MVP</w:t>
      </w:r>
    </w:p>
    """)

    for heading, text_blocks in sections:
      # Heading 1
      body_xml_parts.append(f"""
      <w:p>
        <w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr>
        <w:r>
          <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0F766E"/></w:rPr>
          <w:t>{xml_escape.escape(heading)}</w:t>
        </w:r>
      </w:p>
      """)

      for block in text_blocks:
        if isinstance(block, tuple) and block[0] == 'bullet':
          body_xml_parts.append(f"""
          <w:p>
            <w:pPr><w:ind w:left="480"/><w:spacing w:before="60" w:after="60"/></w:pPr>
            <w:r>
              <w:rPr><w:b/><w:color w:val="0F766E"/></w:rPr>
              <w:t>•  </w:t>
            </w:r>
            <w:r>
              <w:t>{xml_escape.escape(block[1])}</w:t>
            </w:r>
          </w:p>
          """)
        elif isinstance(block, tuple) and block[0] == 'bold_prefix':
          body_xml_parts.append(f"""
          <w:p>
            <w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr>
            <w:r>
              <w:rPr><w:b/><w:color w:val="0F172A"/></w:rPr>
              <w:t>{xml_escape.escape(block[1])}: </w:t>
            </w:r>
            <w:r>
              <w:t>{xml_escape.escape(block[2])}</w:t>
            </w:r>
          </w:p>
          """)
        elif isinstance(block, tuple) and block[0] == 'code':
          body_xml_parts.append(f"""
          <w:p>
            <w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/><w:ind w:left="240" w:right="240"/><w:spacing w:before="120" w:after="120"/></w:pPr>
            <w:r>
              <w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="20"/><w:color w:val="0F172A"/></w:rPr>
              <w:t>{xml_escape.escape(block[1])}</w:t>
            </w:r>
          </w:p>
          """)
        else:
          body_xml_parts.append(f"""
          <w:p>
            <w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr>
            <w:r>
              <w:t>{xml_escape.escape(str(block))}</w:t>
            </w:r>
          </w:p>
          """)

    doc_body = "".join(body_xml_parts)
    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {doc_body}
  </w:body>
</w:document>"""

    # Create .docx ZIP archive
    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as docx:
      docx.writestr('[Content_Types].xml', content_types_xml)
      docx.writestr('_rels/.rels', rels_xml)
      docx.writestr('word/_rels/document.xml.rels', document_rels_xml)
      docx.writestr('word/styles.xml', styles_xml)
      docx.writestr('word/document.xml', document_xml)

    print(f"Docx file created successfully: {filename}")

if __name__ == '__main__':
    report_sections = [
        ("1. Executive Summary", [
            "DawaCard Lite is an open-source, local-first web application engineered to solve prescription fragmentation for patients and family caregivers. It enables users to maintain an organized record of medication dosages, prescription instructions, and allergy statuses, and generates a printable health summary card for medical appointments.",
            ("bold_prefix", "Core Principle", "AI-assisted, human-verified, privacy-conscious, local-first."),
            ("bullet", "Zero Cloud Storage: All patient records, medications, and allergies are stored locally in IndexedDB."),
            ("bullet", "Mandatory Human Verification: All AI-extracted prescription fields require explicit human confirmation."),
            ("bullet", "Printable Summary: One-page A4 print stylesheet for physical carry or PDF export.")
        ]),
        ("2. Problem Statement & Product Vision", [
            "Patients and caregivers frequently store critical health information across prescription slips, physical photographs, and handwritten notes. During healthcare visits, retrieving and communicating this information under time constraints causes anxiety and potential miscommunication.",
            "Existing personal health tools often require user registration, cloud database accounts, or subscription plans. DawaCard Lite provides a lightweight, open-source alternative that runs entirely inside the user's browser without requiring cloud sync or user accounts."
        ]),
        ("3. System Architecture & Stack", [
            ("bold_prefix", "Frontend Framework", "React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React icons"),
            ("bold_prefix", "Local Structured Storage", "IndexedDB (with in-memory fallback) and localStorage for UI state"),
            ("bold_prefix", "AI Integration Proxy", "Node.js Express backend proxy handling Google Gemini 1.5/2.5 Flash API calls securely"),
            ("bold_prefix", "Deployment Architecture", "Vercel Multi-Service setup with rewrites from /api/* to Express service and /(.*) to Vite SPA"),
            ("bold_prefix", "Automated Testing", "Vitest + React Testing Library (100% test pass rate)")
        ]),
        ("4. Key Functional Modules", [
            ("bold_prefix", "FR-01: Dashboard", "Provides active medication counters, explicit allergy status overview, recently updated records list, first-use empty state, and 1-click sample data loader."),
            ("bold_prefix", "FR-02: Patient Profile", "Optional patient display name, date of birth, and personal notes for health card presentation."),
            ("bold_prefix", "FR-03: Medication Management", "Full CRUD operations supporting name, strength, dosage form, route, frequency, duration, start/end dates, current vs discontinued status, and source provenance."),
            ("bold_prefix", "FR-04: Allergy Management", "Enforces 3 non-interchangeable allergy categories: Known Allergies Recorded, No Known Allergies (NKA), and Unknown/Not Recorded."),
            ("bold_prefix", "FR-05 & FR-06: AI Prescription Reader & Review", "Image uploader for JPEG, PNG, WebP (up to 5 MB). Dual-column review screen showing original image alongside editable fields with High, Medium, Low, and Uncertain confidence badges."),
            ("bold_prefix", "FR-07: Health Card Generator", "A4 printable document layout displaying patient info, generated date, last updated date, active medications table, allergy status box, and mandatory clinician disclaimers."),
            ("bold_prefix", "FR-08: Local Data Management", "Privacy indicator, clear-all-data confirmation modal, and JSON import/export backup features.")
        ]),
        ("5. AI Safety & Privacy Rules", [
            ("bullet", "API Secret Security: Gemini API keys are held exclusively in environment variables on the backend proxy server and never exposed to the frontend bundle."),
            ("bullet", "No Automated Saving: AI extraction output is treated strictly as draft candidate text. Explicit user review is required before saving."),
            ("bullet", "No Unsolicited Guesses: Illegible or absent fields return null with an 'uncertain' confidence flag."),
            ("bullet", "Zero Data Retention: Uploaded prescription images are processed in-memory during extraction and are never permanently stored on external cloud servers.")
        ]),
        ("6. Verification & Test Results", [
            ("bold_prefix", "Automated Unit Tests", "7/7 Vitest tests passing cleanly (Storage CRUD, 3 allergy states, clear data, JSON backup/export, 5MB file limit, and offline resilience)."),
            ("bold_prefix", "Production Build", "Vite production build completed with 0 errors and 0 warnings.")
        ])
    ]

    create_docx("DawaCard_Lite_Project_Report.docx", "DawaCard Lite — Project Report", report_sections)
