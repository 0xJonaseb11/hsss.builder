#!/usr/bin/env python3
"""Generate HSSS Builder PWA specification as DOCX (stdlib only)."""
import html
import zipfile
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "HSSS-Builder-PWA-Specification.docx"

WNS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def esc(text: str) -> str:
    return html.escape(text, quote=False)


def run(text: str, bold: bool = False) -> str:
    b = "<w:b/>" if bold else ""
    return f"<w:r><w:rPr>{b}</w:rPr><w:t xml:space=\"preserve\">{esc(text)}</w:t></w:r>"


def para(*parts: str) -> str:
    return f"<w:p>{''.join(parts)}</w:p>"


def heading(text: str, level: int) -> str:
    style = "Title" if level == 0 else f"Heading{level}"
    return (
        f"<w:p><w:pPr><w:pStyle w:val=\"{style}\"/></w:pPr>"
        f"{run(text, bold=True)}</w:p>"
    )


def bullet(text: str) -> str:
    return (
        "<w:p><w:pPr><w:pStyle w:val=\"ListParagraph\"/>"
        "<w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr></w:pPr>"
        f"{run(text)}</w:p>"
    )


def table(rows: list[list[str]]) -> str:
    cols = len(rows[0])
    col_w = 9360 // cols
    grid = "".join(f"<w:gridCol w:w=\"{col_w}\"/>" for _ in range(cols))
    body = ""
    for r_idx, row in enumerate(rows):
        cells = ""
        for cell in row:
            shd = ""
            if r_idx == 0:
                shd = (
                    "<w:tcPr><w:shd w:val=\"clear\" w:color=\"auto\" w:fill=\"F0F4F8\"/></w:tcPr>"
                )
            cells += (
                f"<w:tc>{shd}<w:p>{run(cell, bold=(r_idx == 0))}</w:p></w:tc>"
            )
        body += f"<w:tr>{cells}</w:tr>"
    return (
        f"<w:tbl><w:tblPr><w:tblW w:w=\"0\" w:type=\"auto\"/>"
        f"<w:tblBorders>"
        f"<w:top w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"D8DEE6\"/>"
        f"<w:left w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"D8DEE6\"/>"
        f"<w:bottom w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"D8DEE6\"/>"
        f"<w:right w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"D8DEE6\"/>"
        f"<w:insideH w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"D8DEE6\"/>"
        f"<w:insideV w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"D8DEE6\"/>"
        f"</w:tblBorders></w:tblPr><w:tblGrid>{grid}</w:tblGrid>{body}</w:tbl>"
    )


def build_document_body() -> str:
    parts: list[str] = []

    parts.append(heading("HSSS Builder PWA", 0))
    parts.append(para(run("Specification", bold=False)))
    parts.append(para(run("Prepared by Ramil Huertas | June 2025")))
    parts.append(para(run("Stack: Next.js, TypeScript, Tailwind CSS, Supabase, Vercel")))
    parts.append(para(run("")))
    parts.append(para(run(
        "Builder-facing PWA: register, log in, reset password, sign out, price screens, save quotes, "
        "submit orders. Orders go to Supabase first, then email to HSSS. Installable from the home screen. "
        "Delivery is four steps from setup through production deploy (section 2)."
    )))

    parts.append(heading("1. Features", 1))
    parts.append(table([
        ["Feature", "Detail"],
        ["Registration", "Email and password (Supabase Auth). Profile: company name, ABN, contact, service type, region, address. Saved to builders."],
        ["Login", "Email and password. Session cookies via @supabase/ssr. Routes behind auth redirect to login."],
        ["Forgot password", "Supabase sends reset link. New password at /auth/reset-password."],
        ["Sign out", "Header button on dashboard. Ends session, back to login."],
        ["Quotes", "Live pricing, screen config (Front & Return, Front Only, Splayed, Fixed Panel, Quick Quote). Drafts in Supabase: list, open, delete."],
        ["Orders", "Submit saves to DB, emails HSSS, shows order ref to builder. Order list + detail. Re-order copies into a new quote."],
        ["Dashboard", "Company name, New Quote, My Quotes, My Orders, sign out."],
    ]))
    parts.append(para(run("")))

    parts.append(heading("2. Four steps: development to deployment", 1))

    parts.append(heading("Step 1: Project setup", 2))
    parts.append(para(run(
        "Create the Next.js (App Router) repo with TypeScript and Tailwind. Connect Supabase: Auth, Postgres, env vars for local and Vercel."
    )))
    for item in [
        "Migrations in repo: builders, quotes, orders, order_items, site_contacts. RLS on all tables.",
        "Folder layout: app/, components/, lib/pricing, lib/email, hooks/.",
        "Supabase SSR auth (@supabase/ssr), middleware for protected routes.",
        "Port pricing logic from current App.jsx into lib/pricing.",
    ]:
        parts.append(bullet(item))
    parts.append(para(run("Done when: ", bold=True), run("app runs locally, login works against Supabase, migrations apply cleanly.")))
    parts.append(para(run("")))

    parts.append(heading("Step 2: Core features", 2))
    parts.append(para(run("Build the screens listed in section 1.")))
    for item in [
        "Registration + company profile. Login. Forgot password (/auth/reset-password). Sign out on dashboard.",
        "Quote flow: screen types, live pricing, save draft, My Quotes list.",
        "POST /api/orders/submit: validate session and price, insert order in DB, return reference.",
        "My Orders list and detail. Re-order into new quote. Dashboard with company name and nav.",
    ]:
        parts.append(bullet(item))
    parts.append(para(run("Done when: ", bold=True), run("full quote-to-order path works on localhost with data in Supabase.")))
    parts.append(para(run("")))

    parts.append(heading("Step 3: Email and PWA", 2))
    parts.append(para(run("Wire order email on the server after DB insert. Add installable PWA shell.")))
    parts.append(para(run("Email (pick one, env-configured):", bold=True)))
    parts.append(table([
        ["Provider", "Notes"],
        ["Google SMTP", "smtp.gmail.com, port 587, App Password. Good if @hsss.net.au is on Google Workspace."],
        ["Microsoft 365 SMTP", "smtp.office365.com. Nodemailer, same pattern as Google."],
        ["Resend / SendGrid / Postmark / SES", "REST API alternatives if SMTP is not used."],
    ]))
    parts.append(para(run(
        "Order submitted: email to HSSS inbox. Confirmation email to builder. Auth emails stay on Supabase templates."
    )))
    parts.append(para(
        run("PWA: ", bold=True),
        run("manifest, icons (192, 512, maskable, Apple 180), service worker (Serwist or next-pwa), /offline page, install prompt on Android, iOS add-to-home instructions, reload banner on new deploy."),
    ))
    parts.append(para(run("Done when: ", bold=True), run("test order emails HSSS inbox, app installs to home screen on phone, Lighthouse installability passes.")))
    parts.append(para(run("")))

    parts.append(heading("Step 4: Test and deploy", 2))
    for item in [
        "Deploy preview branch on Vercel. Point Supabase redirect URLs at preview URL for auth testing.",
        "Regression on phone (iOS Safari, Android Chrome): register, login, reset password, sign out, one order per screen type, email received.",
        "Set production env vars on Vercel (Supabase keys, SMTP or email API, ORDER_EMAIL_TO).",
        "Merge to main. Production deploy. Smoke test on live URL.",
        "Custom domain when DNS is ready.",
    ]:
        parts.append(bullet(item))
    parts.append(para(run("Done when: ", bold=True), run("production URL is live, builders can register and submit orders, emails arrive, PWA installs.")))
    parts.append(para(run("")))

    parts.append(heading("3. Stack", 1))
    parts.append(table([
        ["Layer", "Technology"],
        ["Frontend", "Next.js (App Router), TypeScript, Tailwind CSS"],
        ["Auth + database", "Supabase (Auth, Postgres, RLS, migrations in repo)"],
        ["Hosting", "Vercel, including /api/orders/submit"],
        ["Order email", "Google SMTP, Resend, SendGrid, or Postmark (server-side)"],
        ["PWA", "Serwist or next-pwa"],
    ]))
    parts.append(para(run("")))

    parts.append(heading("4. Not in first release", 1))
    parts.append(para(run("Staff admin, AroFlo sync, push, SMS, payments.")))

    return "".join(parts)


CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

DOC_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>"""

STYLES = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="{WNS}">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/><w:qFormat/>
    <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:after="200"/></w:pPr>
    <w:rPr><w:sz w:val="32"/><w:b/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr><w:sz w:val="28"/><w:b/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr>
    <w:rPr><w:sz w:val="24"/><w:b/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/>
  </w:style>
</w:styles>"""

NUMBERING = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="{WNS}">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="\u2022"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>"""


def main() -> None:
    body = build_document_body()
    document = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="{WNS}">
  <w:body>{body}<w:sectPr/></w:body>
</w:document>"""

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", CONTENT_TYPES)
        zf.writestr("_rels/.rels", RELS)
        zf.writestr("word/_rels/document.xml.rels", DOC_RELS)
        zf.writestr("word/document.xml", document)
        zf.writestr("word/styles.xml", STYLES)
        zf.writestr("word/numbering.xml", NUMBERING)

    print(f"Saved: {OUT}")


if __name__ == "__main__":
    main()
