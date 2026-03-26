# 🚀 Guida Completa al Deployment di InnerBuild su Vercel (con Lovable attivo)

Questa guida ti accompagna passo-passo per fare il deploy della tua app InnerBuild su Vercel **mantenendo Lovable come ambiente di sviluppo**. Continuerai a fare modifiche da Lovable, e Vercel si occuperà del deploy in produzione.

> 📌 **Differenza con la Export Guide**: Quella guida è per chi vuole staccarsi completamente da Lovable. Questa guida è per chi vuole **usare Lovable + Vercel insieme** come workflow di sviluppo e produzione.

---

## 📋 Indice

1. [Architettura del Setup](#-architettura-del-setup)
2. [Prerequisiti](#-prerequisiti)
3. [Step 1: Collega GitHub a Lovable](#-step-1-collega-github-a-lovable)
4. [Step 2: Crea il Progetto su Vercel](#-step-2-crea-il-progetto-su-vercel)
5. [Step 3: Configura le Variabili d'Ambiente su Vercel](#-step-3-configura-le-variabili-dambiente-su-vercel)
6. [Step 4: Configura Supabase per il Dominio Vercel](#-step-4-configura-supabase-per-il-dominio-vercel)
7. [Step 5: Configura Google OAuth](#-step-5-configura-google-oauth)
8. [Step 6: Configura Stripe](#-step-6-configura-stripe)
9. [Step 7: Configura Groq AI](#-step-7-configura-groq-ai)
10. [Step 8: Configura le Email (SMTP)](#-step-8-configura-le-email-smtp)
11. [Step 9: Configura il Dominio Personalizzato](#-step-9-configura-il-dominio-personalizzato)
12. [Step 10: Testa Tutto End-to-End](#-step-10-testa-tutto-end-to-end)
13. [Step 11: Workflow Quotidiano](#-step-11-workflow-quotidiano-lovable--vercel)
14. [Step 12: Monitoraggio e Manutenzione](#-step-12-monitoraggio-e-manutenzione)
15. [Riepilogo Completo Secrets e Variabili](#-riepilogo-completo-secrets-e-variabili)
16. [Troubleshooting](#-troubleshooting)
17. [Checklist Finale Pre-Launch](#-checklist-finale-pre-launch)

---

## 🏗️ Architettura del Setup

Ecco come funziona il flusso di lavoro:

```
┌──────────────────────────────────────────────────────────────┐
│                     IL TUO WORKFLOW                          │
│                                                              │
│   Tu (sviluppatore)                                         │
│     │                                                        │
│     ▼                                                        │
│   Lovable (editor AI)                                        │
│     │                                                        │
│     │  push automatico                                       │
│     ▼                                                        │
│   GitHub (repository del codice)                             │
│     │                                                        │
│     │  webhook automatico                                    │
│     ▼                                                        │
│   Vercel (hosting frontend in produzione)                    │
│     │                                                        │
│     │  chiama API                                            │
│     ▼                                                        │
│   Supabase (database + auth + edge functions + storage)      │
│     │                                                        │
│     │  edge functions chiamano                               │
│     ▼                                                        │
│   Stripe (pagamenti) + Groq (AI) + SMTP (email)             │
└──────────────────────────────────────────────────────────────┘
```

### Come funziona in pratica:

1. **Tu scrivi** una richiesta su Lovable
2. **Lovable modifica** il codice e fa automaticamente push su GitHub
3. **Vercel rileva** il push e fa automaticamente il build + deploy
4. **In 1-2 minuti** le modifiche sono live in produzione

> 💡 **Importante**: Le Edge Functions di Supabase vengono deployate automaticamente da Lovable, **non** da Vercel. Vercel gestisce solo il frontend (React/Vite).

---

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere:

| Cosa | Dove | Stato |
|------|------|-------|
| Account Lovable | [lovable.dev](https://lovable.dev) | ✅ Già attivo |
| Account GitHub | [github.com](https://github.com) | Necessario |
| Account Vercel | [vercel.com](https://vercel.com) | Necessario (gratuito) |
| Account Supabase | [supabase.com](https://supabase.com) | ✅ Già configurato |
| Account Stripe | [stripe.com](https://stripe.com) | ✅ Già configurato |
| Account Groq | [console.groq.com](https://console.groq.com) | ✅ Già configurato |
| Un provider SMTP | Gmail / Resend / Mailgun | Necessario per email |

---

## 🔗 Step 1: Collega GitHub a Lovable

Se non l'hai già fatto, devi collegare il tuo progetto Lovable a un repository GitHub.

### 1.1 Vai nelle impostazioni del progetto

1. In Lovable, clicca sul **nome del progetto** in alto a sinistra
2. Seleziona **"Settings"** (Impostazioni)
3. Vai alla tab **"GitHub"** sotto la sezione "Connectors"

### 1.2 Collega il repository

1. Clicca **"Connect to GitHub"**
2. Autorizza Lovable ad accedere al tuo account GitHub
3. Scegli se:
   - **Creare un nuovo repository**: Lovable creerà un repo con il nome del progetto
   - **Collegare un repository esistente**: Se hai già un repo

4. Una volta collegato, vedrai:
   - Il nome del repository
   - Il link diretto a GitHub
   - Lo stato della sincronizzazione

### 1.3 Verifica la sincronizzazione

1. Vai su GitHub e apri il repository
2. Dovresti vedere tutti i file del progetto InnerBuild
3. Verifica che ci siano le cartelle principali:
   - `src/` — codice frontend React
   - `supabase/` — edge functions e config
   - `public/` — asset statici
   - `vercel.json` — configurazione Vercel (già presente)

> ⚠️ **Nota**: Da questo momento, **ogni modifica** fatta su Lovable verrà automaticamente pushata su GitHub. Non serve fare nulla manualmente.

---

## 🌐 Step 2: Crea il Progetto su Vercel

### 2.1 Crea un account Vercel

1. Vai su [vercel.com](https://vercel.com)
2. Clicca **"Sign Up"**
3. **Consiglio**: Registrati con il tuo account GitHub (così il collegamento è automatico)

### 2.2 Importa il progetto da GitHub

1. Dalla dashboard Vercel, clicca **"Add New..." → "Project"**
2. Nella schermata "Import Git Repository":
   - Se hai fatto login con GitHub, vedrai la lista dei tuoi repository
   - Cerca il repository di InnerBuild
   - Clicca **"Import"** accanto al nome del repo

### 2.3 Configura il progetto

Nella schermata di configurazione del progetto, imposta questi valori:

| Impostazione | Valore |
|-------------|--------|
| **Project Name** | `innerbuild` (o quello che preferisci) |
| **Framework Preset** | **Vite** |
| **Root Directory** | `./ ` (lascia il default) |
| **Build Command** | `npm run build` (default per Vite) |
| **Output Directory** | `dist` (default per Vite) |
| **Install Command** | `npm install` (default) |

### 2.4 NON fare ancora il deploy!

**FERMATI QUI** — Prima di cliccare "Deploy", devi configurare le variabili d'ambiente (Step 3). Se fai il deploy senza variabili, il build fallirà.

> 💡 Se hai già cliccato Deploy e il build è fallito, non preoccuparti! Configura le variabili e poi rifai il deploy.

---

## 🔑 Step 3: Configura le Variabili d'Ambiente su Vercel

Questa è la parte più importante. Devi dire a Vercel dove trovare il tuo backend Supabase.

### 3.1 Dove trovare i valori

Vai su **Supabase Dashboard** → **Project Settings** → **API**:

| Dato | Dove trovarlo |
|------|---------------|
| **Project URL** | Sezione "Project URL" — inizia con `https://` |
| **Anon Key** | Sezione "Project API keys" → `anon` `public` — inizia con `eyJ` |
| **Project ID** | Nella URL della dashboard: `https://supabase.com/dashboard/project/QUESTO_QUI` |

Per il tuo progetto specifico:
- **Project URL**: `https://rksmsdzgwkmbhakcgalb.supabase.co`
- **Project ID**: `rksmsdzgwkmbhakcgalb`
- **Anon Key**: la chiave che inizia con `eyJhbGci...` (la trovi nel tuo `.env` o nella dashboard Supabase)

### 3.2 Aggiungi le variabili su Vercel

1. Vai su Vercel → il tuo progetto → **Settings** → **Environment Variables**
2. Aggiungi queste **3 variabili** una per una:

#### Variabile 1: VITE_SUPABASE_URL

| Campo | Valore |
|-------|--------|
| **Key** | `VITE_SUPABASE_URL` |
| **Value** | `https://rksmsdzgwkmbhakcgalb.supabase.co` |
| **Environment** | ✅ Production, ✅ Preview, ✅ Development |

#### Variabile 2: VITE_SUPABASE_PUBLISHABLE_KEY

| Campo | Valore |
|-------|--------|
| **Key** | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| **Value** | La tua anon key (inizia con `eyJhbGci...`) |
| **Environment** | ✅ Production, ✅ Preview, ✅ Development |

#### Variabile 3: VITE_SUPABASE_PROJECT_ID

| Campo | Valore |
|-------|--------|
| **Key** | `VITE_SUPABASE_PROJECT_ID` |
| **Value** | `rksmsdzgwkmbhakcgalb` |
| **Environment** | ✅ Production, ✅ Preview, ✅ Development |

### 3.3 Cosa NON mettere su Vercel

> 🚨 **ATTENZIONE SICUREZZA**: Le seguenti chiavi **NON DEVONO MAI** essere aggiunte su Vercel:

| Chiave | Perché NON va su Vercel |
|--------|------------------------|
| `STRIPE_API_KEY` | È una chiave segreta server-side → va nei Supabase Secrets |
| `GROQ_API_KEY` | È una chiave segreta server-side → va nei Supabase Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Dà accesso admin al database → va nei Supabase Secrets |

**Regola d'oro**: Su Vercel vanno **SOLO** le variabili che iniziano con `VITE_` (sono pubbliche e finiscono nel bundle JavaScript del browser). Tutto il resto va nei **Supabase Edge Function Secrets**.

### 3.4 Fai il primo deploy

Dopo aver configurato le variabili:

1. Vai su Vercel → il tuo progetto → **Deployments**
2. Clicca sui **tre puntini (...)** accanto all'ultimo deployment fallito
3. Seleziona **"Redeploy"**
4. Attendi 1-2 minuti per il build

Se tutto è configurato correttamente, vedrai:
- ✅ Build completato con successo
- ✅ Un URL del tipo `innerbuild-xxxx.vercel.app`

> 💡 **Primo deploy riuscito?** Apri l'URL e verifica che la landing page si carichi. Non preoccuparti se il login non funziona ancora — devi prima configurare i redirect in Supabase (Step 4).

---

## 🗄️ Step 4: Configura Supabase per il Dominio Vercel

Dopo il primo deploy, Vercel ti assegna un URL (es. `innerbuild.vercel.app`). Devi dire a Supabase che questo dominio è autorizzato.

### 4.1 Configura gli URL di redirect

1. Vai su **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Configura:

| Campo | Valore |
|-------|--------|
| **Site URL** | `https://innerbuild.vercel.app` (o il tuo dominio custom) |

3. Nella sezione **Redirect URLs**, aggiungi TUTTI questi URL:

```
https://innerbuild.vercel.app
https://innerbuild.vercel.app/dashboard
https://innerbuild.vercel.app/reset-password
https://innerbuild.vercel.app/**
```

Se hai anche un dominio personalizzato (es. `innerbuild.com`), aggiungi anche:

```
https://innerbuild.com
https://innerbuild.com/dashboard
https://innerbuild.com/reset-password
https://innerbuild.com/**
```

> ⚠️ **CRITICO**: Se non aggiungi questi redirect URL, il login (soprattutto Google OAuth e reset password) **non funzionerà** e vedrai errori tipo "Redirect URI mismatch".

### 4.2 Verifica le Edge Functions

Le Edge Functions di Supabase sono già deployate da Lovable. Verifica che funzionino:

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Dovresti vedere tutte le funzioni:

| Funzione | Scopo | Stato atteso |
|----------|-------|-------------|
| `ai-coach` | Chat AI Coach | ✅ Active |
| `ai-coach-engine` | Report AI settimanali | ✅ Active |
| `analyze-habits` | Analisi abitudini real-time | ✅ Active |
| `analyze-habit-report` | Report dettagliato abitudini | ✅ Active |
| `analyze-triggers` | Analisi trigger real-time | ✅ Active |
| `analyze-trigger-report` | Report dettagliato trigger | ✅ Active |
| `challenge-daily-content` | Contenuto giornaliero sfide | ✅ Active |
| `check-subscription` | Verifica abbonamento | ✅ Active |
| `create-checkout` | Sessione checkout Stripe | ✅ Active |
| `create-portal` | Portale clienti Stripe | ✅ Active |
| `debrief-suggestions` | Suggerimenti debrief | ✅ Active |
| `emergency-urge` | Supporto emergenza | ✅ Active |
| `recovery-phase-insight` | Insight fase recupero | ✅ Active |
| `whats-working` | Report "cosa funziona" | ✅ Active |

3. Se una funzione non è attiva o manca, chiedi a Lovable di rideploy-arla.

### 4.3 Verifica i Supabase Secrets

1. Vai su **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Verifica che questi secrets siano configurati:

| Secret | Stato atteso |
|--------|-------------|
| `STRIPE_API_KEY` | ✅ Configurato |
| `GROQ_API_KEY` | ✅ Configurato (se usi AI) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Auto-configurato da Supabase |
| `SUPABASE_URL` | ✅ Auto-configurato da Supabase |
| `SUPABASE_ANON_KEY` | ✅ Auto-configurato da Supabase |

> ℹ️ `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` sono automaticamente disponibili in ogni Edge Function — non serve aggiungerli manualmente.

Se `STRIPE_API_KEY` o `GROQ_API_KEY` non sono configurati, vedi Step 6 e Step 7.

---

## 🔐 Step 5: Configura Google OAuth

Per far funzionare il login con Google sul tuo dominio Vercel.

### 5.1 Verifica la configurazione attuale

1. Vai su **Supabase Dashboard** → **Authentication** → **Providers**
2. Verifica che **Google** sia abilitato
3. Se non è abilitato, devi configurarlo:

### 5.2 Configura Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Seleziona il tuo progetto (o creane uno nuovo)
3. Vai su **APIs & Services** → **Credentials**
4. Se non hai già un OAuth Client, creane uno:
   - Clicca **"Create Credentials"** → **"OAuth Client ID"**
   - Tipo: **Web application**
   - Nome: `InnerBuild`

5. Configura gli **Authorized JavaScript Origins** (aggiungi TUTTI):

```
https://innerbuild.vercel.app
https://tuodominio.com          (se hai un dominio custom)
http://localhost:5173            (per sviluppo locale, opzionale)
```

6. Configura gli **Authorized Redirect URIs** (aggiungi):

```
https://rksmsdzgwkmbhakcgalb.supabase.co/auth/v1/callback
```

> ⚠️ **Nota importante**: Il redirect URI è quello di **Supabase**, non di Vercel! Supabase gestisce il callback OAuth e poi reindirizza l'utente al tuo sito.

7. Copia il **Client ID** e il **Client Secret**

### 5.3 Configura Supabase

1. Vai su **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. Inserisci:
   - **Client ID**: il valore copiato da Google Console
   - **Client Secret**: il valore copiato da Google Console
3. Salva

### 5.4 Testa il login Google

1. Apri il tuo sito su Vercel (es. `https://innerbuild.vercel.app`)
2. Vai alla pagina di login
3. Clicca "Accedi con Google"
4. Dovresti vedere la schermata di consenso Google
5. Dopo l'autorizzazione, dovresti essere reindirizzato alla dashboard

> 🐛 **Se non funziona**: Vedi la sezione [Troubleshooting](#-troubleshooting) in fondo.

---

## 💳 Step 6: Configura Stripe

### 6.1 Verifica le chiavi Stripe

1. Vai su [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **API Keys**
2. Avrai due set di chiavi:

| Tipo | Formato | Quando usarla |
|------|---------|---------------|
| **Test** | `sk_test_...` e `pk_test_...` | Durante lo sviluppo |
| **Live** | `sk_live_...` e `pk_live_...` | In produzione |

> 💡 **Consiglio**: Inizia con le chiavi **test** (`sk_test_...`). Passa a quelle live solo quando sei pronto per accettare pagamenti reali.

### 6.2 Aggiungi la Secret Key in Supabase

1. Vai su **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Cerca `STRIPE_API_KEY`:
   - Se esiste già, verifica che il valore sia corretto
   - Se non esiste, aggiungilo:
     - **Nome**: `STRIPE_API_KEY`
     - **Valore**: `sk_test_...` (o `sk_live_...` per produzione)

### 6.3 Come funziona Stripe nell'app

L'app usa tre Edge Functions per Stripe:

```
┌─────────────────────────────────────────────────────────┐
│                   FLUSSO PAGAMENTO                       │
│                                                          │
│   Utente clicca "Abbonati"                               │
│     │                                                    │
│     ▼                                                    │
│   Frontend chiama create-checkout                        │
│     │                                                    │
│     ▼                                                    │
│   Edge Function crea sessione Stripe                     │
│   (usa STRIPE_API_KEY dai Supabase Secrets)              │
│     │                                                    │
│     ▼                                                    │
│   Utente viene reindirizzato a Stripe Checkout           │
│     │                                                    │
│     ▼                                                    │
│   Dopo il pagamento → reindirizzato a /dashboard         │
│     │                                                    │
│     ▼                                                    │
│   check-subscription verifica lo stato ad ogni accesso   │
└─────────────────────────────────────────────────────────┘
```

| Edge Function | Cosa fa |
|--------------|---------|
| `create-checkout` | Crea una sessione Stripe Checkout per l'abbonamento InnerBuild Pro (€9.99/mese). Crea automaticamente il prodotto e il prezzo se non esistono. |
| `create-portal` | Apre il portale clienti Stripe dove l'utente può gestire/cancellare il suo abbonamento. |
| `check-subscription` | Verifica in tempo reale se l'utente ha un abbonamento attivo su Stripe. |

> 💡 **Non serve creare prodotti su Stripe manualmente!** La funzione `create-checkout` crea automaticamente il prodotto "InnerBuild Pro" e il prezzo al primo checkout.

### 6.4 Testa il pagamento

1. Vai sul tuo sito Vercel
2. Accedi con un account
3. Vai alla pagina Pricing
4. Clicca su "Abbonati"
5. Nella pagina Stripe Checkout, usa questa carta di test:

| Campo | Valore |
|-------|--------|
| Numero carta | `4242 4242 4242 4242` |
| Scadenza | Qualsiasi data futura (es. `12/30`) |
| CVC | Qualsiasi 3 cifre (es. `123`) |
| Nome | Qualsiasi nome |

6. Dopo il pagamento, dovresti tornare alla dashboard come utente Premium

### 6.5 Webhook Stripe (opzionale)

Per gestire automaticamente eventi come cancellazioni:

1. Vai su **Stripe Dashboard** → **Developers** → **Webhooks**
2. Aggiungi endpoint: `https://rksmsdzgwkmbhakcgalb.supabase.co/functions/v1/stripe-webhook`
3. Seleziona eventi:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

> ⚠️ Al momento l'app non ha una Edge Function `stripe-webhook`. Senza webhook, l'app verifica lo stato dell'abbonamento in tempo reale tramite l'API Stripe ad ogni accesso (funzione `check-subscription`), quindi **funziona comunque**.

---

## 🤖 Step 7: Configura Groq AI

### 7.1 Ottieni la API Key

1. Vai su [Groq Console](https://console.groq.com)
2. Crea un account o accedi
3. Vai su **API Keys** nella sidebar sinistra
4. Clicca **"Create API Key"**
5. Dai un nome alla chiave (es. "InnerBuild Production")
6. **Copia la chiave** — non potrai vederla di nuovo!

### 7.2 Aggiungi la chiave in Supabase

1. Vai su **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Cerca `GROQ_API_KEY`:
   - Se esiste già, verifica che il valore sia la tua chiave Groq
   - Se non esiste, aggiungilo:
     - **Nome**: `GROQ_API_KEY`
     - **Valore**: la tua chiave (inizia con `gsk_...`)

### 7.3 Funzionalità AI dell'app

L'app usa il modello **`llama-3.3-70b-versatile`** tramite Groq per:

| Funzionalità | Edge Function | Quando si attiva |
|-------------|--------------|-----------------|
| Chat AI Coach | `ai-coach` | Quando l'utente chatta con il coach |
| Report AI settimanali | `ai-coach-engine` | Automaticamente ogni 7 giorni |
| Analisi abitudini | `analyze-habits` | In tempo reale quando ci sono dati |
| Report abitudini | `analyze-habit-report` | Ogni 4 giorni se ci sono abbastanza dati |
| Analisi trigger | `analyze-triggers` | In tempo reale quando ci sono trigger |
| Report trigger | `analyze-trigger-report` | Ogni 4 giorni se ci sono abbastanza dati |
| Contenuto sfide | `challenge-daily-content` | Ogni giorno per sfide attive |
| Suggerimenti debrief | `debrief-suggestions` | Dopo una ricaduta |
| Supporto emergenza | `emergency-urge` | Quando l'utente preme il bottone SOS |
| Insight recupero | `recovery-phase-insight` | Basato sulla fase di recupero |
| Cosa funziona | `whats-working` | Ogni 7 giorni |

### 7.4 Limiti di Groq

| Piano Groq | Limite | Consiglio |
|-----------|--------|-----------|
| **Free** | ~30 req/min, ~14.400 req/giorno | OK per sviluppo e pochi utenti |
| **Developer** | Limiti più alti | Consigliato per beta testing |
| **Production** | Limiti custom | Necessario per lancio pubblico |

> 💡 Se raggiungi i limiti gratuiti, l'AI Coach mostrerà errori temporanei. Passa a un piano a pagamento Groq o considera provider alternativi (OpenAI, Anthropic).

---

## 📧 Step 8: Configura le Email (SMTP)

Supabase invia email per: registrazione, reset password, cambio email. Il server SMTP integrato ha **limiti severi** (2 email/ora). **DEVI configurare un SMTP personalizzato.**

### 8.1 Scegli un provider

#### Opzione A: Gmail SMTP (semplice, per volumi bassi, max ~500/giorno)

1. Crea o usa un account Gmail dedicato (es. `noreply@innerbuild.com` o `innerbuild.app@gmail.com`)
2. Abilita la **2FA** (autenticazione a due fattori) su quell'account Google
3. Vai su [Google App Passwords](https://myaccount.google.com/apppasswords)
4. Genera una **App Password** per "Mail"
5. Configurazione:

| Campo | Valore |
|-------|--------|
| **Host** | `smtp.gmail.com` |
| **Port** | `465` |
| **Username** | `innerbuild.app@gmail.com` (email completa) |
| **Password** | La App Password (16 caratteri, senza spazi) |
| **Sender email** | `innerbuild.app@gmail.com` |
| **Sender name** | `InnerBuild` |

#### Opzione B: Resend (consigliato per produzione)

1. Crea un account su [resend.com](https://resend.com)
2. Aggiungi e verifica il tuo dominio (istruzioni nella dashboard Resend)
3. Genera una API Key
4. Configurazione:

| Campo | Valore |
|-------|--------|
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | La tua API Key (inizia con `re_`) |
| **Sender email** | `noreply@tuodominio.com` |
| **Sender name** | `InnerBuild` |

### 8.2 Configura SMTP su Supabase

1. Vai su **Supabase Dashboard** → **Project Settings** → **Authentication** → **SMTP Settings**
2. Abilita **"Enable Custom SMTP"**
3. Inserisci i dati del provider scelto (vedi sopra)
4. Clicca **"Save"**

### 8.3 Personalizza i Template Email

Vai su **Supabase Dashboard** → **Authentication** → **Email Templates**

I template da personalizzare sono 3:

1. **Confirm signup** (email di benvenuto/conferma registrazione)
2. **Reset password** (email per reimpostare la password)
3. **Change email** (conferma cambio indirizzo email)

> 📧 I template HTML dettagliati (con lo stile InnerBuild dark theme + viola) li trovi nella **EXPORT_GUIDE.md** al Step 6.2. Puoi copiarli e incollarli direttamente nei campi template di Supabase.

### 8.4 Testa le email

1. **Test registrazione**: Crea un nuovo account → controlla la casella email (e spam) → clicca il link di conferma
2. **Test reset password**: Vai su `/forgot-password` → inserisci email → controlla la casella → clicca il link → reimposta la password
3. **Verifica che i link puntino al dominio corretto** (il tuo dominio Vercel, non `localhost`)

---

## 🌐 Step 9: Configura il Dominio Personalizzato

### 9.1 Su Vercel

1. Vai su Vercel → il tuo progetto → **Settings** → **Domains**
2. Clicca **"Add"**
3. Inserisci il tuo dominio (es. `innerbuild.com` o `app.innerbuild.com`)
4. Vercel ti mostrerà i record DNS da configurare:

| Tipo | Nome | Valore |
|------|------|--------|
| **CNAME** | `www` | `cname.vercel-dns.com` |
| **A** | `@` | `76.76.21.21` |

5. Vai nel pannello del tuo registrar DNS (Cloudflare, Namecheap, GoDaddy, ecc.) e aggiungi questi record
6. Attendi la propagazione DNS (da pochi minuti a 48 ore)
7. Vercel abiliterà automaticamente **HTTPS** (certificato SSL Let's Encrypt)

### 9.2 Aggiorna le configurazioni

Dopo aver configurato il dominio, devi aggiornare:

#### In Supabase (Authentication → URL Configuration):

| Campo | Nuovo valore |
|-------|-------------|
| **Site URL** | `https://tuodominio.com` |
| **Redirect URLs** | Aggiungi: `https://tuodominio.com`, `https://tuodominio.com/**` |

#### In Google Cloud Console (Credentials → OAuth Client):

| Campo | Aggiungi |
|-------|---------|
| **Authorized JavaScript Origins** | `https://tuodominio.com` |

> ⚠️ Il **Redirect URI** di Supabase (`https://rksmsdzgwkmbhakcgalb.supabase.co/auth/v1/callback`) **resta invariato** — non cambia con il dominio custom.

#### In Stripe Dashboard (se usi webhook):

Aggiorna l'URL del webhook se necessario.

---

## ✅ Step 10: Testa Tutto End-to-End

Dopo aver configurato tutto, esegui questa checklist di test completa:

### Test 1: Landing Page
- [ ] Apri `https://tuodominio.com` (o l'URL Vercel)
- [ ] La landing page si carica correttamente
- [ ] Le immagini e i font si caricano
- [ ] Il menu di navigazione funziona

### Test 2: Registrazione
- [ ] Vai su `/auth?mode=signup`
- [ ] Crea un account con email e password
- [ ] Ricevi l'email di conferma
- [ ] Clicca il link di conferma
- [ ] Sei reindirizzato alla dashboard con sessione attiva

### Test 3: Login/Logout
- [ ] Fai logout
- [ ] Fai login con email e password
- [ ] Fai login con Google (se configurato)
- [ ] La sessione persiste dopo il refresh della pagina

### Test 4: Reset Password
- [ ] Vai su `/forgot-password`
- [ ] Inserisci la tua email
- [ ] Ricevi l'email di reset
- [ ] Clicca il link → arrivi su `/reset-password`
- [ ] Imposta una nuova password
- [ ] Fai login con la nuova password

### Test 5: Dashboard e Funzionalità Core
- [ ] La dashboard si carica con i dati corretti
- [ ] Puoi creare/modificare/eliminare abitudini
- [ ] Puoi completare abitudini (check-in)
- [ ] La riflessione serale funziona
- [ ] I task giornalieri funzionano

### Test 6: AI Coach (richiede GROQ_API_KEY)
- [ ] Vai alla sezione AI Coach
- [ ] Invia un messaggio
- [ ] Ricevi una risposta dall'AI in italiano
- [ ] La conversazione viene salvata

### Test 7: Stripe (richiede STRIPE_API_KEY)
- [ ] Vai alla pagina Pricing
- [ ] Clicca "Abbonati"
- [ ] Completa il checkout con carta test `4242 4242 4242 4242`
- [ ] Torni alla dashboard come utente Premium
- [ ] Le funzionalità Premium sono sbloccate

### Test 8: PWA (Progressive Web App)
- [ ] Su mobile, il browser propone "Installa app"
- [ ] Dopo l'installazione, l'app funziona come app nativa
- [ ] L'icona dell'app è corretta

### Test 9: Recovery e Trigger (Premium)
- [ ] La sezione Recovery funziona
- [ ] Il tracking dei trigger funziona
- [ ] I report AI vengono generati

### Test 10: Sicurezza
- [ ] Verifica che non ci siano chiavi segrete nel codice sorgente (Ctrl+U nel browser)
- [ ] Verifica che i security headers siano presenti (DevTools → Network → seleziona una richiesta → Headers)
- [ ] Verifica che le pagine protette reindirizzino al login se non autenticato

---

## 🔄 Step 11: Workflow Quotidiano (Lovable + Vercel)

### Come fare modifiche

```
1. Apri Lovable
2. Scrivi la tua richiesta (es. "Aggiungi un bottone X alla pagina Y")
3. Lovable modifica il codice
4. Lovable fa push su GitHub automaticamente
5. Vercel rileva il push
6. Vercel fa il build e deploy automaticamente
7. In 1-2 minuti le modifiche sono live!
```

### Preview vs Produzione

| Ambiente | URL | Quando si aggiorna |
|----------|-----|-------------------|
| **Lovable Preview** | `https://id-preview--*.lovable.app` | Istantaneamente mentre lavori |
| **Vercel Preview** | `https://progetto-git-branch.vercel.app` | Ad ogni push su branch non-main |
| **Vercel Production** | `https://tuodominio.com` | Ad ogni push su `main` |

### Quando serve intervenire manualmente?

| Situazione | Azione |
|-----------|--------|
| Modifica al codice frontend | Nessuna — automatico via Lovable → GitHub → Vercel |
| Modifica a Edge Function | Nessuna — Lovable le deploya automaticamente su Supabase |
| Modifica allo schema del database | Lovable crea la migration e la applica automaticamente |
| Nuova variabile d'ambiente `VITE_*` | Devi aggiungerla manualmente su Vercel |
| Nuovo Supabase Secret | Lovable te lo chiede e lo aggiunge |
| Cambio dominio | Devi aggiornare Vercel + Supabase + Google OAuth |

---

## 📊 Step 12: Monitoraggio e Manutenzione

### Dove controllare se qualcosa non va

| Cosa controllare | Dove |
|-----------------|------|
| Build errors frontend | Vercel → Deployments → clicca sull'ultimo deploy → Build Logs |
| Errori Edge Functions | Supabase Dashboard → Edge Functions → seleziona funzione → Logs |
| Errori database | Supabase Dashboard → Database → Logs |
| Errori autenticazione | Supabase Dashboard → Authentication → Logs |
| Errori Stripe | Stripe Dashboard → Developers → Logs |
| Performance frontend | Vercel → Analytics (se abilitato) |
| Errori runtime JS | DevTools del browser → Console |

### Manutenzione periodica

| Cosa | Ogni quanto | Come |
|------|-------------|------|
| Controlla i log delle Edge Functions | Settimanalmente | Supabase Dashboard |
| Verifica lo stato dei pagamenti Stripe | Settimanalmente | Stripe Dashboard |
| Controlla l'utilizzo Groq | Mensilmente | Groq Console |
| Aggiorna le dipendenze npm | Mensilmente | Lovable o `npm audit` |
| Controlla i security headers | Dopo ogni modifica al `vercel.json` | [securityheaders.com](https://securityheaders.com) |

---

## 📋 Riepilogo Completo Secrets e Variabili

### 🟢 Su Vercel (variabili pubbliche, frontend)

| Variabile | Valore | Tipo |
|-----------|--------|------|
| `VITE_SUPABASE_URL` | `https://rksmsdzgwkmbhakcgalb.supabase.co` | Pubblico |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGci...` (anon key) | Pubblico |
| `VITE_SUPABASE_PROJECT_ID` | `rksmsdzgwkmbhakcgalb` | Pubblico |

### 🔴 Su Supabase Secrets (chiavi private, server-side)

| Secret | Dove ottenerlo | Usato da |
|--------|----------------|----------|
| `STRIPE_API_KEY` | [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys) | `create-checkout`, `create-portal`, `check-subscription` |
| `GROQ_API_KEY` | [Groq Console → API Keys](https://console.groq.com/keys) | Tutte le Edge Functions AI |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Auto-configurato | Alcune Edge Functions |
| `SUPABASE_URL` | ✅ Auto-configurato | Tutte le Edge Functions |
| `SUPABASE_ANON_KEY` | ✅ Auto-configurato | Tutte le Edge Functions |

### 🔵 Configurazioni Esterne

| Servizio | Dove configurarlo | Cosa configurare |
|----------|-------------------|-----------------|
| **Google OAuth** | [Google Cloud Console](https://console.cloud.google.com) + Supabase Auth Providers | Client ID, Client Secret, Redirect URI |
| **SMTP Email** | Supabase Auth → SMTP Settings | Host, Port, Username, Password |
| **Stripe** | [Stripe Dashboard](https://dashboard.stripe.com) | API Keys, (opzionale: Webhooks) |
| **Supabase Auth URLs** | Supabase Auth → URL Configuration | Site URL, Redirect URLs |

---

## 🆘 Troubleshooting

### ❌ Il build su Vercel fallisce

**Errore: "Cannot find module..."**
- Verifica che le variabili `VITE_*` siano configurate su Vercel
- Prova a fare **Redeploy** dalla dashboard Vercel

**Errore: "Type error..."**
- Questo è un errore nel codice TypeScript — chiedi a Lovable di fixarlo
- Controlla i build logs per il file e la riga specifici

### ❌ La pagina è bianca dopo il deploy

- Apri i DevTools del browser (F12) → Console → cerca errori rossi
- Il motivo più comune è che le variabili `VITE_*` non sono configurate su Vercel
- Verifica che il **Framework Preset** su Vercel sia impostato su **Vite**

### ❌ Login con Google non funziona

**Errore "redirect_uri_mismatch"**:
- Verifica che il Redirect URI in Google Console sia esattamente:
  `https://rksmsdzgwkmbhakcgalb.supabase.co/auth/v1/callback`
- Verifica che il tuo dominio Vercel sia negli **Authorized JavaScript Origins**

**Errore "This app isn't verified"**:
- Questo è normale in fase di sviluppo
- Clicca "Advanced" → "Go to InnerBuild (unsafe)" per procedere
- Per rimuovere l'avviso, completa la verifica dell'app in Google Cloud Console

### ❌ Login con email non funziona

- Verifica che il **Site URL** in Supabase Auth sia il tuo dominio Vercel
- Verifica che i **Redirect URLs** includano il tuo dominio
- Controlla la cartella spam se non ricevi le email

### ❌ Le email non arrivano

- Verifica la configurazione SMTP in Supabase (Step 8)
- Per Gmail: assicurati di usare una **App Password**, non la password normale
- Controlla i log email in Supabase Dashboard → Authentication → Logs
- Prova a inviare a un indirizzo diverso (Gmail, Outlook, ecc.)

### ❌ AI Coach non risponde

- Verifica che `GROQ_API_KEY` sia nei Supabase Secrets
- Controlla i log della Edge Function `ai-coach` in Supabase Dashboard
- Potresti aver raggiunto il limite gratuito di Groq — controlla su [console.groq.com](https://console.groq.com)

### ❌ Stripe checkout non funziona

- Verifica che `STRIPE_API_KEY` sia nei **Supabase Secrets** (NON su Vercel!)
- In sviluppo usa `sk_test_...`, in produzione `sk_live_...`
- Controlla i log della Edge Function `create-checkout`
- Verifica in Stripe Dashboard → Developers → Logs per errori

### ❌ Errore 404 quando refresho una pagina

- Il file `vercel.json` con i rewrites dovrebbe risolvere questo. Verifica che sia presente nella root del repository con:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

### ❌ Le modifiche da Lovable non appaiono su Vercel

- Verifica che GitHub sia collegato a Lovable (Settings → GitHub)
- Verifica che Vercel sia collegato allo stesso repository GitHub
- Controlla nella tab Deployments di Vercel se c'è un nuovo deploy in corso
- Se il deploy è fallito, controlla i build logs

---

## ✅ Checklist Finale Pre-Launch

### Infrastruttura
- [ ] GitHub collegato a Lovable
- [ ] Vercel collegato a GitHub
- [ ] Build Vercel riuscita
- [ ] `vercel.json` presente con rewrites e security headers
- [ ] HTTPS attivo (automatico con Vercel)
- [ ] Dominio personalizzato configurato (opzionale)

### Variabili e Secrets
- [ ] `VITE_SUPABASE_URL` su Vercel ✅
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` su Vercel ✅
- [ ] `VITE_SUPABASE_PROJECT_ID` su Vercel ✅
- [ ] `STRIPE_API_KEY` nei Supabase Secrets ✅
- [ ] `GROQ_API_KEY` nei Supabase Secrets ✅
- [ ] Nessuna chiave segreta esposta nel frontend ✅

### Autenticazione
- [ ] Login con email funziona
- [ ] Login con Google funziona
- [ ] Reset password funziona
- [ ] Redirect URL configurati in Supabase
- [ ] SMTP personalizzato configurato
- [ ] Template email personalizzati

### Funzionalità
- [ ] Dashboard si carica correttamente
- [ ] Abitudini: crea, modifica, completa
- [ ] AI Coach risponde in italiano
- [ ] Stripe checkout funziona (carta test)
- [ ] Funzionalità Premium sbloccate dopo pagamento
- [ ] Recovery e Trigger tracking funzionano
- [ ] PWA installabile su mobile

### Sicurezza
- [ ] Security headers attivi (CSP, X-Frame-Options, ecc.)
- [ ] Nessuna chiave segreta nel codice sorgente
- [ ] RLS policies attive su tutte le tabelle
- [ ] Edge Functions validano l'autenticazione

---

## 📞 Risorse Utili

| Risorsa | Link |
|---------|------|
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| Vercel Docs | [vercel.com/docs](https://vercel.com/docs) |
| Stripe Docs | [stripe.com/docs](https://stripe.com/docs) |
| Groq Docs | [console.groq.com/docs](https://console.groq.com/docs) |
| Google OAuth Docs | [developers.google.com/identity](https://developers.google.com/identity/protocols/oauth2) |
| Lovable Docs | [docs.lovable.dev](https://docs.lovable.dev) |

---

*Guida creata il 26 Marzo 2026 — Specifica per il progetto InnerBuild*
*Per la guida all'esportazione completa (rimozione Lovable), vedi `EXPORT_GUIDE.md`*
