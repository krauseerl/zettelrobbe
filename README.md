<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./logo-dark.png">
  <img src="./logo.png" alt="Zettelrobbe" width="480">
</picture>

<h1>Zettelrobbe</h1>

[![Latest Release](https://img.shields.io/github/v/release/admonstrator/zettelrobbe?style=for-the-badge&logo=github&color=0ea5e9)](https://github.com/admonstrator/zettelrobbe/releases/latest) [![Docker Pulls](https://img.shields.io/docker/pulls/admonstrator/zettelrobbe?style=for-the-badge&logo=docker&color=10b981)](https://hub.docker.com/r/admonstrator/zettelrobbe) [![CI](https://img.shields.io/github/actions/workflow/status/admonstrator/zettelrobbe/ci.yml?branch=main&style=for-the-badge&logo=githubactions&label=CI)](https://github.com/admonstrator/zettelrobbe/actions/workflows/ci.yml) [![Docs](https://img.shields.io/badge/docs-Live-0891b2?style=for-the-badge&logo=readthedocs)](https://zettelrob.be/)

[🧠 What makes it "Next"](#-the-evolution-what-makes-it-next) | [💖 Fuel the Evolution](#-fuel-the-evolution) | [🚀 Quick Start](#-quick-start) | [💬 Frequently Asked Questions](#-frequently-asked-questions)

</div>

---

## 📊 At a Glance: Next vs. Original

| Feature                                     | Paperless-AI | Zettelrobbe |
| ------------------------------------------- | ------------ | ----------- |
| **Core automation**                         |              |             |
| AI-based document classification            | ✅           | ✅          |
| Paperless-ngx integration                   | ✅           | ✅          |
| Basic manual processing flows               | ✅           | ✅          |
| **Performance and scale**                   |              |             |
| Server-side history pagination              | ❌           | ✅          |
| Tag caching with reduced API calls          | ❌           | ✅          |
| Faster dashboard behavior under high volume | ❌           | ✅          |
| **Security and reliability**                |              |             |
| Security-focused dependency maintenance     | ✅           | ✅          |
| Global API + SSE rate limiting              | ❌           | ✅          |
| MFA login support                           | ❌           | ✅          |
| **OCR and recovery workflows**              |              |             |
| Works with blurry documents and images      | ❌           | ✅          |
| **UX and operations**                       |              |             |
| Settings tabs with runtime ENV hints        | ❌           | ✅          |

---

## 🚀 The Evolution: What makes it "Next"?

This isn't just a collection of patches; it's a total overhaul of how your documents interact with AI. I took the original logic and ran it through a "Does this actually make my life easier?" filter.

### 🧠 High-IQ Classification

Connect to OpenAI, Ollama, or any OpenAI-compatible API. We've moved beyond simple keyword matching. The AI now understands **intent and context**, meaning it knows the difference between an "Electricity Bill" and a "Manual for a Toaster" without you writing a single regex.

### 🧹 Duplicates: merge tags and correspondents that drifted apart

Years of tagging leave "Amazon", "amazon" and "Amazon EU S.a.r.l." side by side. The **Duplicates** page scans your Paperless-ngx on request, groups names that mean the same thing (case and umlaut spellings, legal forms, singular/plural, word order, typos), tells you _why_ it thinks so and how sure it is, and merges each group into the survivor you pick: documents move first, the leftover objects are deleted only once they are empty. Every merge is logged locally and can be undone from the same page. An assistant at the top of the page says what a run does, what it costs before it starts, what happens while it runs and how the tools below are used once it is done; the proposal lands in those tools as ticks, and a pair only the model proposed is never ticked on its own. Nothing runs on its own.

### 👓 Flexible OCR Vision (Mistral + Local)

Waging war against blurry scans, shaky smartphone photos, and handwritten scribbles that standard OCR usually chokes on. You can run OCR with:

- Mistral OCR (`provider: mistral`)
- local OpenAI-compatible vision APIs (`provider: ollama` + `/v1` endpoint, e.g. LM Studio, vLLM, or any other OpenAI-compatible server)
- native Ollama chat vision APIs (`provider: ollama` + `/api/chat` endpoint)

This isn't locked to one model. **Any vision-capable model your endpoint serves works** — for example `llama3.2-vision`, `gemma3`, `qwen2-vl`, `minicpm-v`, `moondream`, `pixtral`, `internvl`, or `llava`. During setup, **Quickstart** probes your endpoint and automatically detects which of its models are vision-capable, so you don't have to guess.

Multi-page PDFs are also fully supported for local vision models: pages are rendered to images via `poppler` and sent to the model one by one, instead of only OCRing a single-page thumbnail (see [OCR Provider Notes](#ocr-provider-notes) below). Mistral OCR handles PDFs natively.

The OCR setup now also validates real image reading instead of only checking endpoint reachability.

### ⚡️ Performance without the "Spinner-Induced Rage"

I hated the lag in the original UI. I've implemented **server-side pagination** and **aggressive tag caching**. Whether you're managing 100 documents or 10,000, the dashboard stays snappy and your browser stays alive.

### 🛡️ Hardened for Production

I use this for my own life and my own documents. That means security isn't an afterthought - it's a requirement. Expect regular dependency updates, a reduced container attack surface, and error handling that fails gracefully instead of taking your whole stack down with it.

### 🧩 The "Best of" Community DNA

There were dozens of brilliant ideas and PRs left gathering dust in the original repository. I've personally hand-picked, tested, and integrated the best community suggestions, making this the most feature-complete version of the tool available.

### 🤖 Vibe-Coded, Human-Vetted

Built with heavy AI assistance but steered by human common sense. It's _vibe-coded_ in the sense that I prioritize how the tool _actually feels_ to use over rigid corporate specs. Yet it's engineered to be more stable than your enterprise-driven _Microsoft Access '97_ ~~nightmare~~ business software.

---

## 💖 Fuel the Evolution

Maintaining this solo, chasing bugs, and keeping up with the rapid pace of AI is a massive labor of love. If this tool saves your sanity (and your weekends), consider fueling the next update. Whether it's a cold energy drink or just a "thanks"; your support keeps the code flowing.

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=github)](https://github.com/sponsors/admonstrator) [![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/admon) [![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/aaronviehl) [![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/admon)

</div>

---

## ⚠️ A Note on Stability & Migration

**Data is sacred. Back it up.**

Because **Zettelrobbe** introduces significant architectural improvements and new database logic, it's a "one-way street" evolution. Since I am cleaning up and optimizing the core logic plus adding new features, there is no guarantee of stability right now.

> However, I develop this for my own production environment, so I have zero interest in breaking things. However, every server is different. **Please create a full backup of your Paperless-ngx**. If you're coming from the original version, a fresh install is often the cleanest path to document zen.

---

## 🚀 Quick Start

### Docker Compose (Recommended)

Please check the docker variables [here](https://zettelrob.be/getting-started/configuration/#docker-environment-variables) for all configuration options.

> If you are using plain HTTP (like running **Zettelrobbe** locally on your NAS, your PC, or in your home network), make sure to set `COOKIE_SECURE_MODE=never` to avoid login issues! See [Configuration](https://zettelrob.be/getting-started/configuration/#cookie-and-proxy-flags-all-supported-values) for details. Using a reverse proxy like Nginx or Caddy with HTTPS is highly recommended for security and performance, especially if you expose the service to the internet.

```yaml
services:
  zettelrobbe:
    image: admonstrator/zettelrobbe:latest
    container_name: zettelrobbe
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - data:/app/data

volumes:
  data:
```

Then open [http://localhost:3000](http://localhost:3000) to complete setup.

### OCR Provider Notes

- OCR API key env: `OCR_API_KEY` (backward-compatible fallback: `MISTRAL_API_KEY`)
- Local OCR supports model discovery from both `/api/tags` (Ollama-style) and `/v1/models` (OpenAI-compatible)
- OCR test sends a real PNG image and expects the exact token: `OCR-TEST-182730173401`
- For OpenAI-compatible endpoints that reject data URLs, OCR validation automatically retries with raw base64 payload
- Local vision OCR renders multi-page PDFs to per-page images via poppler (`pdftoppm`, bundled in the Docker image) and sends each page to the model. Configure with `OCR_PDF_RENDER_ENABLED` (default `yes`), `OCR_PDF_RENDER_MAX_PAGES` (default `10`, each page is one model request), and `OCR_PDF_RENDER_DPI` (default `150`)
- On bare-metal installs, install `poppler-utils` to enable multi-page PDF OCR; without it the app falls back to OCRing only the first-page thumbnail
- The Mistral OCR provider processes PDFs natively and ignores the `OCR_PDF_RENDER_*` settings
- The OCR queue can be worked through automatically instead of pressing **Process All Pending**: enable `OCR_AUTO_PROCESS_ENABLED` (default `no`) and configure `OCR_AUTO_PROCESS_INTERVAL` (cron, default `*/15 * * * *`), `OCR_AUTO_PROCESS_BATCH_SIZE` (documents per run, default `10`) and `OCR_AUTO_ANALYZE` (run AI analysis right after OCR, default `yes`). Runs are skipped while a document scan is active or while Paperless-ngx is unreachable, so queued documents are never marked as failed because of an outage

### Single Sign-On (OIDC)

Zettelrobbe can sign you in through any standards-compliant OpenID Connect provider: Authentik, Authelia, Keycloak, Kanidm, Pocket ID, Zitadel, Microsoft Entra ID, Google and others. Nothing is provider-specific: endpoints, signing keys and supported client authentication methods are read from the provider's discovery document. It is off by default, and the local username/password login keeps working next to it.

Zettelrobbe has a single local account, so SSO does not create users: the identity from the provider is mapped onto that account — first by e-mail address (the provider's `email` claim against the account's e-mail), then by username (`preferred_username` against the account's username) — and anyone who matches neither is refused. Set or change the account's e-mail and username under **Settings → Account** (the e-mail is optional and can also be given in the setup wizard). Local TOTP is not asked for on an SSO login — enforce MFA at the provider instead.

| Variable                        | Default                  | Purpose                                                                                                                                                                                                                                                                          |
| ------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OIDC_ENABLED`                  | `no`                     | Turns single sign-on on                                                                                                                                                                                                                                                          |
| `OIDC_ISSUER_URL`               | –                        | The provider's issuer URL (see the table below), or its full `/.well-known/openid-configuration` URL. A missing or extra trailing slash is tolerated                                                                                                                             |
| `OIDC_CLIENT_ID`                | –                        | Client ID                                                                                                                                                                                                                                                                        |
| `OIDC_CLIENT_SECRET`            | –                        | Client secret; leave empty for a public client (PKCE is always used)                                                                                                                                                                                                             |
| `OIDC_TOKEN_AUTH_METHOD`        | automatic                | `client_secret_basic`, `client_secret_post` or `none`. Automatic: `none` without a secret, otherwise `client_secret_basic` (the specification's default) unless the provider only lists `client_secret_post`. Set it when the provider requires a specific method for the client |
| `OIDC_REDIRECT_URI`             | derived from the request | Must equal the URI registered at the provider: `https://<your-host>/auth/oidc/callback`. Set it explicitly behind a reverse proxy                                                                                                                                                |
| `OIDC_SCOPES`                   | `openid profile email`   | Requested scopes; `groups` is added automatically when `OIDC_ALLOWED_GROUPS` is set and the provider advertises that scope                                                                                                                                                       |
| `OIDC_ADMIN_EMAIL`              | –                        | The administrator's e-mail address for SSO matching, set in the environment. Takes precedence over the address under **Settings → Account**                                                                                                                                      |
| `OIDC_EMAIL_CLAIM`              | `email`                  | Claim compared (case-insensitive) with the account's e-mail address. Tried first                                                                                                                                                                                                 |
| `OIDC_REQUIRE_VERIFIED_EMAIL`   | `no`                     | Only match by e-mail when the provider sends `email_verified: true`. Leave off for Authentik, which always sends `false`                                                                                                                                                         |
| `OIDC_USERNAME_CLAIM`           | `preferred_username`     | Claim compared (exact, then case-insensitive) with the local username when the e-mail does not match. Dotted paths reach nested claims                                                                                                                                           |
| `OIDC_GROUPS_CLAIM`             | `groups`                 | Claim holding the user's groups (dotted paths allowed, e.g. `realm_access.roles`)                                                                                                                                                                                                |
| `OIDC_ALLOWED_GROUPS`           | –                        | Comma-separated; when set, only members of one of these groups may sign in                                                                                                                                                                                                       |
| `OIDC_PROVIDER_NAME`            | `SSO`                    | Button label: "Sign in with …"                                                                                                                                                                                                                                                   |
| `OIDC_AUTO_REDIRECT`            | `no`                     | Send `/login` straight to the provider; `/login?local=1` still shows the password form                                                                                                                                                                                           |
| `OIDC_PROVIDER_LOGOUT`          | `no`                     | Also end the session at the provider (RP-initiated logout) when an SSO user logs out, if the provider advertises an `end_session_endpoint`                                                                                                                                       |
| `OIDC_POST_LOGOUT_REDIRECT_URI` | `<origin>/login?local=1` | Where the provider sends the browser after provider logout; register it at the provider if it validates this URI                                                                                                                                                                 |

**Setting up any provider**

1. Register a client / application at the provider: authorization code flow, confidential client (or public with PKCE), redirect URI `https://<your-zettelrobbe-host>/auth/oidc/callback`, scopes `openid profile email`.
2. Set `OIDC_ENABLED=yes`, `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` and `OIDC_REDIRECT_URI`.
3. Tell Zettelrobbe your e-mail address at the provider: set `OIDC_ADMIN_EMAIL` in the environment, or enter it under **Settings → Account** (or make the username match the provider's `preferred_username`).
4. Restrict who may use the application at the provider, or with `OIDC_ALLOWED_GROUPS`: whoever matches signs in as the one administrator. Many providers let users edit their own e-mail address, so do not rely on the e-mail match alone to keep others out.

Issuer URLs and notes for common providers:

| Provider           | `OIDC_ISSUER_URL`                                    | Notes                                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentik          | `https://<host>/application/o/<app-slug>/`           | Default `profile` scope carries `preferred_username` and `groups`                                                                                                                                 |
| Authelia           | `https://<authelia-host>`                            | Groups need the `groups` scope (added automatically with `OIDC_ALLOWED_GROUPS`); the client's `token_endpoint_auth_method` defaults to `client_secret_basic`, which is also Zettelrobbe's default |
| Keycloak           | `https://<host>/realms/<realm>`                      | For groups, add a _Group Membership_ mapper with claim name `groups` (full group path off)                                                                                                        |
| Kanidm             | `https://<host>/oauth2/openid/<client-id>`           | Issuer is per client                                                                                                                                                                              |
| Pocket ID          | `https://<pocket-id-host>`                           |                                                                                                                                                                                                   |
| Zitadel            | `https://<instance-domain>`                          |                                                                                                                                                                                                   |
| Microsoft Entra ID | `https://login.microsoftonline.com/<tenant-id>/v2.0` | `preferred_username` is the UPN; the `groups` claim holds group object IDs                                                                                                                        |
| Google             | `https://accounts.google.com`                        | No `preferred_username`; matching works through the e-mail address                                                                                                                                |

### Container Images

| Image Tag                         | Size        |
| --------------------------------- | ----------- |
| `admonstrator/zettelrobbe:latest` | ~500–700 MB |

**Docker Hub:** [admonstrator/zettelrobbe](https://hub.docker.com/r/admonstrator/zettelrobbe)

Versioned release tags use the format `vYYYY.MM.##` (example: `v2026.03.01`).

---

## 💬 Frequently Asked Questions

### "Is this project stable if it's vibe-coded?"

**Short answer:** I use it every day for my actual documents. If it breaks, my own life becomes a chaotic mess of untagged invoices—so I have a very strong biological incentive to keep it stable.

**Long answer:** It's not _vibe-coded_ in the sense of being random; I test every feature and try to automate as much of the testing as possible. And _NO!_ it's not just one pile of AI-generated code inside a main.js file. Since I work as an IT architect, I understand the importance of maintainable code.

### "So you don't read the code? Should I be worried?"

I can read and understand code logic, but I don't write JavaScript from scratch myself. I treat AI like a talented, slightly erratic junior dev. I guide the architecture, I read and audit the logic of every line it generates, and I test the hell out of it. I am the filter. No "AI-slop" gets merged without passing my "Does this actually solve the problem?" test. Or at least, it doesn't stay merged if I encounter issues in production. You can learn more about the author's background and the AI-assisted development workflow on the [About the Project & Author](https://zettelrob.be/about/) page.

### "Why was RAG (semantic search/chat) support removed?"

We decided to focus the project entirely on its core mission: highly reliable automated document tagging, correspondent detection, and custom field/metadata extraction. Running a secondary Python RAG container with a vector database (ChromaDB) added massive image sizes, high RAM requirements, and severe architectural overhead. For a detailed breakdown of this decision, check out the [RAG Deprecation page](https://zettelrob.be/rag-deprecation/).

### "What if I'm a 'real' developer and I find a bug?"

**Please, for the love of all that is holy, open a PR.** I welcome everyone; from fellow vibe-coders to the wizards who actually understand memory management. If you see something that makes your inner _Senior Architect_ cry, fix it and send it over. I'm happy to learn, as long as we keep the "it just works" spirit alive.

### "Why should I use this instead of the original project?"

If the original works for you, stay there! But if you're tired of loading spinners, want better AI and OCR, then **Zettelrobbe** is for you. It's a more polished, more powerful, and more user-friendly evolution of the original vision.

### "Does this support [Specific Niche AI Provider]?"

If it's OpenAI-compatible, it probably works. If not, open an issue! Since I have an AuDHD brain, I'm prone to hyper-focusing on cool new features — so if your suggestion catches my interest, it might be implemented before my second energy drink.

---

<div align="center">

**Zettelrobbe is made with ❤️ by admon for the community**

⭐ If you find this useful, please star the repository!

</div>
