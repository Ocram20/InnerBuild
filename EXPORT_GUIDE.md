# 🚀 Guida Completa all'Esportazione di InnerBuild

Questa guida ti accompagna passo-passo per rendere l'app **completamente indipendente** da Lovable.

---

## 📋 Prerequisiti

- Account [Supabase](https://supabase.com) (gratuito)
- Account [Stripe](https://stripe.com) (già configurato)
- Account [Groq](https://console.groq.com) per le API AI
- Account [Google Cloud Console](https://console.cloud.google.com) per OAuth
- Un servizio SMTP per le email (Gmail, Resend, Mailgun, ecc.)
- [Node.js](https://nodejs.org) v18+ installato
- [Supabase CLI](https://supabase.com/docs/guides/cli) installata

---

## 📦 Step 1: Esporta il Codice da GitHub

1. Vai su GitHub e clona il repository:
   ```bash
   git clone <URL_DEL_TUO_REPOSITORY>
   cd <NOME_PROGETTO>
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. **Rimuovi le dipendenze Lovable** (non più necessarie):
   ```bash
   npm uninstall @lovable.dev/cloud-auth-js lovable-tagger
   ```

4. **Elimina i file Lovable**:
   ```bash
   rm -rf src/integrations/lovable/
   ```

5. **Modifica `vite.config.ts`** — rimuovi `lovable-tagger`:
   ```typescript
   // RIMUOVI questa riga:
   import { componentTagger } from "lovable-tagger";
   
   // RIMUOVI questa riga dai plugins:
   mode === "development" && componentTagger(),
   ```

   Il file finale dovrebbe essere:
   ```typescript
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react-swc";
   import path from "path";
   import { VitePWA } from "vite-plugin-pwa";

   export default defineConfig(({ mode }) => ({
     server: {
       host: "::",
       port: 8080,
     },
     plugins: [
       react(),
       VitePWA({
         // ... configurazione PWA invariata
       }),
     ],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   }));
   ```

---

## 🗄️ Step 2: Crea e Configura Supabase

### 2.1 Crea un nuovo progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Crea un nuovo progetto (scegli una regione vicina ai tuoi utenti, es. `eu-central-1`)
3. Annota questi valori dal **Project Settings → API**:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key** (chiave pubblica): inizia con `eyJ...`
   - **Service Role Key** (chiave privata): inizia con `eyJ...` — **NON esporla mai nel frontend**

### 2.2 Applica le Migrazioni del Database

Le migrazioni sono nella cartella `supabase/migrations/`. Applicale in ordine:

**Opzione A — Tramite Supabase CLI (consigliato):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref <TUO_PROJECT_ID>
supabase db push
```

**Opzione B — Manualmente via SQL Editor:**
1. Vai su Supabase Dashboard → SQL Editor
2. Esegui ogni file `.sql` dalla cartella `supabase/migrations/` **in ordine cronologico** (dal più vecchio al più recente)

### 2.3 Tabelle create dalle migrazioni

| Tabella | Scopo |
|---------|-------|
| `profiles` | Profili utente (nome, avatar, subscription, stripe_customer_id) |
| `habits` | Abitudini create dall'utente |
| `habit_logs` | Log completamento abitudini |
| `habit_analytics` | Statistiche abitudini (streak, completion rate, pattern) |
| `habit_adaptations` | Adattamenti AI delle abitudini |
| `trigger_logs` | Log dei trigger (emozione, intensità, contesto) |
| `trigger_insights` | Insights AI sui trigger |
| `detox_challenges` | Sfide detox (con `jokers_remaining`, streak, durata) |
| `challenge_daily_entries` | Contenuto giornaliero per ogni sfida (missioni, coach message) |
| `daily_tasks` | Task giornalieri |
| `daily_reflections` | Riflessioni serali (gratitudine, lezioni apprese) |
| `daily_checkins` | Check-in giornalieri (mood/energy) |
| `not_to_do_items` | Lista "non fare" |
| `recovery_journey` | Percorso di recupero |
| `recovery_checkins` | Check-in recupero |
| `reflections` | Riflessioni |
| `journal_entries` | Diario personale |
| `chat_messages` | Messaggi chat AI Coach |
| `ai_insights` | Report e insights AI |
| `articles` | Articoli/blog (CMS) |
| `failure_debriefs` | Debrief post-ricaduta |
| `health_suggestions` | Suggerimenti salute |
| `wearable_health_data` | Dati wearable |
| `user_roles` | Ruoli utente (admin/moderator/user) |

### 2.4 Esporta i dati esistenti (opzionale)

Se hai dati nel database Lovable Cloud che vuoi mantenere, **prima** di scollegarti:

1. Da Lovable Cloud → Database → Tables → seleziona ogni tabella → **Export**
2. Oppure usa `pg_dump` se hai accesso diretto
3. Importa i dati nel nuovo progetto Supabase tramite SQL Editor o `psql`

### 2.5 Verifica le RLS Policies

Dopo le migrazioni, verifica che tutte le RLS policies siano attive:
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Tutte le tabelle utente dovrebbero avere policy `auth.uid() = user_id` per SELECT, INSERT, UPDATE, DELETE.

### 2.6 Verifica i Trigger

Assicurati che il trigger per la creazione automatica del profilo sia attivo:
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' OR event_object_schema = 'auth';
```

Se manca il trigger `handle_new_user`, crealo:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2.7 Storage Buckets

Ricrea il bucket per gli avatar:
1. Supabase Dashboard → Storage → **New Bucket**
2. Nome: `avatars`, **Public**: Sì
3. Aggiungi la policy di accesso pubblico per SELECT

---

## 🔐 Step 3: Configura Google OAuth

### 3.1 Google Cloud Console

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuovo progetto o selezionane uno esistente
3. Vai su **APIs & Services → OAuth consent screen**
   - User Type: **External**
   - App name: **InnerBuild**
   - Scopes: `email`, `profile`, `openid`
4. Vai su **APIs & Services → Credentials**
5. Clicca **Create Credentials → OAuth Client ID**
6. Tipo: **Web application**
7. Configura:
   - **Authorized JavaScript origins**:
     - `https://tuodominio.com`
     - `http://localhost:5173` (per sviluppo locale)
   - **Authorized redirect URIs**:
     - `https://<TUO_PROJECT_ID>.supabase.co/auth/v1/callback`

8. Annota **Client ID** e **Client Secret**

### 3.2 Configura Supabase Auth

1. Supabase Dashboard → **Authentication → Providers**
2. Abilita **Google**
3. Inserisci Client ID e Client Secret dal passo precedente
4. Salva

### 3.3 Nessuna modifica al codice necessaria! ✅

Il codice dell'app usa già `supabase.auth.signInWithOAuth({ provider: "google" })` direttamente, quindi **non serve alcuna modifica** al file `Auth.tsx`. L'autenticazione Google funzionerà automaticamente con il nuovo progetto Supabase.

---

## 💳 Step 4: Configura Stripe

### 4.1 Chiavi Stripe

1. Vai su [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → API Keys**
2. Copia la **Secret Key**: `sk_live_...` (produzione) o `sk_test_...` (test)

### 4.2 Aggiungi Secret in Supabase

1. Supabase Dashboard → **Project Settings → Edge Functions → Secrets**
2. Aggiungi:
   - **Nome**: `STRIPE_API_KEY`
   - **Valore**: la tua Secret Key

### 4.3 Edge Functions per Stripe

L'app usa tre edge functions per Stripe:

| Funzione | Scopo |
|----------|-------|
| `create-checkout` | Crea sessione checkout per abbonamento (€4.99/mese) |
| `create-portal` | Apre il portale clienti Stripe per gestione abbonamento |
| `check-subscription` | Verifica lo stato dell'abbonamento dell'utente |

Queste funzioni creano automaticamente il prodotto "InnerBuild Pro" e il prezzo su Stripe al primo checkout. **Non serve creare prodotti manualmente**.

### 4.4 Webhook Stripe (opzionale ma consigliato)

Per gestire eventi come cancellazione o aggiornamento abbonamento:

1. Stripe Dashboard → **Developers → Webhooks**
2. Aggiungi endpoint: `https://<TUO_PROJECT_ID>.supabase.co/functions/v1/stripe-webhook`
3. Seleziona eventi:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

> ⚠️ **Nota**: Al momento l'app non ha una edge function `stripe-webhook`. Se vuoi gestire automaticamente cancellazioni e aggiornamenti, dovrai crearla. Senza webhook, l'app verifica lo stato dell'abbonamento in tempo reale tramite l'API Stripe ad ogni accesso (funzione `check-subscription`), quindi funziona comunque.

---

## 🤖 Step 5: Configura Groq AI

### 5.1 Ottieni la API Key

1. Vai su [Groq Console](https://console.groq.com)
2. Crea un account o accedi
3. Vai su **API Keys** → Crea una nuova chiave

### 5.2 Aggiungi il Secret in Supabase

1. Supabase Dashboard → **Project Settings → Edge Functions → Secrets**
2. Aggiungi:
   - **Nome**: `GROQ_API_KEY`
   - **Valore**: la tua chiave Groq

### 5.3 Edge Functions AI

L'app usa il modello **`llama-3.3-70b-versatile`** per tutte le funzionalità AI:

| Funzione | Scopo |
|----------|-------|
| `ai-coach` | Chat AI Coach (conversazione) |
| `ai-coach-engine` | Generazione report AI settimanali |
| `analyze-habits` | Analisi abitudini in tempo reale |
| `analyze-habit-report` | Report dettagliato abitudini (ogni 4 giorni) |
| `analyze-triggers` | Analisi trigger in tempo reale |
| `analyze-trigger-report` | Report dettagliato trigger (ogni 4 giorni) |
| `challenge-daily-content` | Contenuto giornaliero sfide detox (missioni, coach) |
| `debrief-suggestions` | Suggerimenti AI per debrief post-ricaduta |
| `emergency-urge` | Supporto emergenza durante impulso |
| `recovery-phase-insight` | Insight sulla fase di recupero corrente |
| `whats-working` | Report "cosa sta funzionando" (ogni 7 giorni) |

> 💡 **Nota su Groq**: Il piano gratuito di Groq ha limiti di rate (30 req/min). Per produzione con molti utenti, considera un piano a pagamento o un provider alternativo (OpenAI, Anthropic, ecc.) modificando l'URL dell'API nelle edge functions.

---

## 📧 Step 6: Configura le Email (SMTP)

Supabase invia email per: **conferma registrazione (benvenuto)**, **reset password**, magic link, cambio email. Di default usa il server SMTP integrato di Supabase, che ha **limiti severi** (2 email/ora in produzione). **Devi configurare un SMTP personalizzato.**

### 6.1 Scegli un provider SMTP

#### Opzione A: Gmail SMTP (semplice, per volumi bassi)

1. Crea o usa un account Gmail dedicato (es. `noreply@tuodominio.com` o `innerbuild.app@gmail.com`)
2. Abilita la **2FA** su quell'account Google
3. Vai su [Google App Passwords](https://myaccount.google.com/apppasswords)
4. Genera una **App Password** per "Mail"
5. Su Supabase Dashboard → **Project Settings → Authentication → SMTP Settings**:
   - **Enable Custom SMTP**: ✅ On
   - **Host**: `smtp.gmail.com`
   - **Port**: `465`
   - **Username**: `innerbuild.app@gmail.com` (indirizzo email completo)
   - **Password**: la App Password generata (16 caratteri senza spazi)
   - **Sender email**: `innerbuild.app@gmail.com`
   - **Sender name**: `InnerBuild`

> ⚠️ Gmail ha un limite di ~500 email/giorno. Per volumi maggiori, usa Resend o Mailgun.

#### Opzione B: Resend (consigliato per produzione)

1. Crea un account su [resend.com](https://resend.com)
2. Aggiungi e verifica il tuo dominio
3. Genera una API Key
4. Su Supabase Dashboard → **Project Settings → Authentication → SMTP Settings**:
   - **Host**: `smtp.resend.com`
   - **Port**: `465`
   - **Username**: `resend`
   - **Password**: la tua API Key di Resend (inizia con `re_`)
   - **Sender email**: `noreply@tuodominio.com`
   - **Sender name**: `InnerBuild`

#### Opzione C: Mailgun, SendGrid, Amazon SES

Stesso principio: ottieni le credenziali SMTP dal provider e inseriscile nella configurazione SMTP di Supabase.

### 6.2 Configura i Template Email

Vai su Supabase Dashboard → **Authentication → Email Templates** e personalizza i seguenti template:

#### 📩 Template: Conferma Registrazione (Email di Benvenuto)

Questo template viene inviato automaticamente quando un nuovo utente si registra con email e password.

```html
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0a0a0a; color: #e0e0e0;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a78bfa; font-size: 28px; margin: 0;">InnerBuild</h1>
    <p style="color: #888; font-size: 14px; margin-top: 4px;">Il tuo percorso di crescita inizia ora</p>
  </div>
  
  <h2 style="color: #ffffff; font-size: 22px;">Benvenuto in InnerBuild! 🎯</h2>
  
  <p>Ciao,</p>
  <p>Grazie per esserti registrato. Conferma il tuo indirizzo email cliccando il pulsante qui sotto per attivare il tuo account:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" 
       style="background: linear-gradient(135deg, #a78bfa, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
      ✅ Conferma Email e Attiva Account
    </a>
  </div>
  
  <p style="color: #aaa; font-size: 14px;">Dopo la conferma potrai:</p>
  <ul style="color: #aaa; font-size: 14px;">
    <li>Creare abitudini personalizzate</li>
    <li>Iniziare sfide detox</li>
    <li>Ricevere supporto dall'AI Coach</li>
    <li>Monitorare i tuoi trigger</li>
  </ul>
  
  <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
  <p style="color: #666; font-size: 12px; text-align: center;">Se non hai creato tu questo account, ignora questa email.</p>
  <p style="color: #666; font-size: 12px; text-align: center;">— Il team InnerBuild</p>
</div>
```

#### 🔑 Template: Reset Password

Questo template viene inviato quando un utente richiede il reset della password dalla pagina "Password dimenticata".

```html
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0a0a0a; color: #e0e0e0;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a78bfa; font-size: 28px; margin: 0;">InnerBuild</h1>
  </div>
  
  <h2 style="color: #ffffff; font-size: 22px;">Reset della Password 🔐</h2>
  
  <p>Ciao,</p>
  <p>Hai richiesto il reset della password del tuo account InnerBuild. Clicca il pulsante qui sotto per scegliere una nuova password:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" 
       style="background: linear-gradient(135deg, #a78bfa, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
      🔑 Resetta la Password
    </a>
  </div>
  
  <p style="color: #aaa; font-size: 14px;">⏱️ Questo link scade tra <strong>1 ora</strong>. Se scade, richiedi un nuovo reset dalla pagina di login.</p>
  
  <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
  <p style="color: #666; font-size: 12px; text-align: center;">Se non hai richiesto tu il reset, ignora questa email. La tua password rimarrà invariata.</p>
  <p style="color: #666; font-size: 12px; text-align: center;">— Il team InnerBuild</p>
</div>
```

#### ✉️ Template: Cambio Email

```html
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0a0a0a; color: #e0e0e0;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #a78bfa; font-size: 28px; margin: 0;">InnerBuild</h1>
  </div>
  
  <h2 style="color: #ffffff; font-size: 22px;">Conferma Cambio Email</h2>
  
  <p>Ciao,</p>
  <p>Hai richiesto di cambiare il tuo indirizzo email. Conferma cliccando qui sotto:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" 
       style="background: linear-gradient(135deg, #a78bfa, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
      Conferma Nuovo Indirizzo
    </a>
  </div>
  
  <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;" />
  <p style="color: #666; font-size: 12px; text-align: center;">Se non hai richiesto questo cambio, ignora questa email.</p>
  <p style="color: #666; font-size: 12px; text-align: center;">— Il team InnerBuild</p>
</div>
```

### 6.3 Configura i Redirect URL

In Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://tuodominio.com`
- **Redirect URLs** (aggiungi tutti questi):
  - `https://tuodominio.com`
  - `https://tuodominio.com/reset-password`
  - `https://tuodominio.com/dashboard`
  - `http://localhost:5173` (per sviluppo)
  - `http://localhost:5173/reset-password`
  - `http://localhost:5173/dashboard`

> ⚠️ **Importante**: Il redirect per il reset password DEVE includere `/reset-password` perché l'app ha una pagina dedicata (`ResetPassword.tsx`) che gestisce il token di recupero e mostra il form per la nuova password.

### 6.4 Come funziona il flusso email nell'app

#### Flusso Registrazione (Email di Benvenuto):
1. L'utente compila il form su `/auth?mode=signup`
2. Il codice chiama `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
3. Supabase invia automaticamente l'email di **conferma registrazione** usando il template configurato
4. L'utente clicca il link nell'email → viene reindirizzato all'app con sessione attiva
5. Il trigger `handle_new_user` crea automaticamente il profilo nella tabella `profiles`

#### Flusso Reset Password:
1. L'utente clicca "Password dimenticata?" nella pagina di login
2. Viene portato su `/forgot-password` e inserisce la sua email
3. Il codice chiama `supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://tuodominio.com/reset-password" })`
4. Supabase invia l'email di **reset password** usando il template configurato
5. L'utente clicca il link → viene reindirizzato a `/reset-password` con un token valido
6. La pagina `ResetPassword.tsx` valida il token e mostra il form per la nuova password
7. Dopo il reset, l'utente viene scollegato e reindirizzato al login

> 💡 **Nessuna modifica al codice necessaria!** Tutti i flussi email sono già implementati nell'app. Devi solo configurare l'SMTP e i template su Supabase.

### 6.5 Verifica che le email funzionino

Dopo aver configurato SMTP e template, esegui questi test:

1. **Test registrazione**: Crea un nuovo account con un'email reale → verifica di ricevere l'email di benvenuto → clicca il link di conferma → verifica che l'account si attivi
2. **Test reset password**: Vai su `/forgot-password` → inserisci l'email → verifica di ricevere l'email → clicca il link → verifica che il form di reset funzioni → accedi con la nuova password
3. **Controlla spam**: Se le email non arrivano, controlla la cartella spam/junk

---

## ⚡ Step 7: Deploy delle Edge Functions

### 7.1 Setup CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref <TUO_PROJECT_ID>
```

### 7.2 Deploy di tutte le funzioni

```bash
# Deploy una per una
supabase functions deploy ai-coach
supabase functions deploy ai-coach-engine
supabase functions deploy analyze-habit-report
supabase functions deploy analyze-habits
supabase functions deploy analyze-trigger-report
supabase functions deploy analyze-triggers
supabase functions deploy challenge-daily-content
supabase functions deploy check-subscription
supabase functions deploy create-checkout
supabase functions deploy create-portal
supabase functions deploy debrief-suggestions
supabase functions deploy emergency-urge
supabase functions deploy recovery-phase-insight
supabase functions deploy whats-working

# Oppure tutte insieme:
supabase functions deploy
```

### 7.3 Configurazione JWT

Il file `supabase/config.toml` è già configurato con `verify_jwt = false` per tutte le funzioni. Questo è necessario perché le funzioni gestiscono l'autenticazione internamente via Bearer token.

> ⚠️ **Importante**: Dopo il deploy, verifica che il `config.toml` sia stato applicato. In caso contrario, puoi disabilitare la verifica JWT per ogni funzione dalla Supabase Dashboard → Edge Functions → Settings di ogni funzione.

---

## 🔧 Step 8: Variabili d'Ambiente Frontend

### 8.1 Crea il file `.env`

Nella root del progetto:

```env
VITE_SUPABASE_URL=https://<TUO_PROJECT_ID>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<TUA_ANON_KEY>
VITE_SUPABASE_PROJECT_ID=<TUO_PROJECT_ID>
```

### 8.2 Verifica `src/integrations/supabase/client.ts`

Questo file usa già le variabili d'ambiente — **non serve modificarlo**:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

### 8.3 Rigenera i Tipi TypeScript

Dopo aver applicato le migrazioni al nuovo progetto:

```bash
supabase gen types typescript --project-id <TUO_PROJECT_ID> > src/integrations/supabase/types.ts
```

---

## 🌐 Step 9: Deploy dell'Applicazione

### Opzione A: Vercel (consigliato)

1. Vai su [vercel.com](https://vercel.com)
2. Importa il repository da GitHub
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Aggiungi le variabili d'ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
7. Deploy!

> ⚠️ Per SPA con client-side routing, aggiungi un file `vercel.json`:
> ```json
> {
>   "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
> }
> ```

### Opzione B: Netlify

1. Vai su [netlify.com](https://netlify.com)
2. Importa da GitHub
3. **Build command**: `npm run build`
4. **Publish directory**: `dist`
5. Aggiungi le variabili d'ambiente
6. Aggiungi un file `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
7. Deploy!

### Opzione C: Self-hosted (VPS, Docker, ecc.)

```bash
npm run build
# Servi la cartella 'dist' con Nginx, Apache, Caddy, ecc.
```

Esempio configurazione Nginx:
```nginx
server {
    listen 80;
    server_name tuodominio.com;
    root /var/www/innerbuild/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔒 Step 10: Riepilogo Secrets e Servizi

### Secrets nelle Edge Functions di Supabase

| Secret | Dove ottenerlo | Necessario per |
|--------|----------------|----------------|
| `STRIPE_API_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) | Pagamenti e abbonamenti |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) | Tutte le funzionalità AI |

> ℹ️ `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` sono **automaticamente disponibili** in ogni edge function di Supabase — non serve aggiungerli manualmente.

### Variabili d'Ambiente Frontend (.env)

| Variabile | Dove ottenerla |
|-----------|----------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Settings → API (anon key) |
| `VITE_SUPABASE_PROJECT_ID` | Supabase Dashboard → Settings → General |

### Configurazioni Esterne

| Servizio | Dove configurarlo | Note |
|----------|-------------------|------|
| Google OAuth | Google Cloud Console + Supabase Auth Providers | Redirect URI: `https://<PROJECT_ID>.supabase.co/auth/v1/callback` |
| SMTP Email | Supabase Auth → SMTP Settings | Gmail, Resend, Mailgun, ecc. |
| Stripe Webhook | Stripe Dashboard → Webhooks | Opzionale, l'app funziona anche senza |

---

## ✅ Checklist Finale Pre-Launch

### Database & Auth
- [ ] Migrazioni applicate con successo
- [ ] RLS policies attive su tutte le tabelle
- [ ] Trigger `handle_new_user` funzionante
- [ ] Storage bucket `avatars` creato e pubblico
- [ ] Google OAuth configurato e funzionante
- [ ] SMTP personalizzato configurato (Gmail/Resend/altro)
- [ ] Template email personalizzati (benvenuto, reset password, cambio email)
- [ ] URL di redirect configurati (Site URL + Redirect URLs incluso `/reset-password`)
- [ ] Test registrazione email + ricezione email di benvenuto + conferma ✅
- [ ] Test login Google ✅
- [ ] Test reset password (invio email + click link + reset + login con nuova password) ✅

### Pagamenti
- [ ] `STRIPE_API_KEY` configurato nei secrets
- [ ] Edge functions Stripe deployate (create-checkout, create-portal, check-subscription)
- [ ] Test checkout in modalità test (`sk_test_...`)
- [ ] Verifica che il prodotto "InnerBuild Pro" venga creato automaticamente

### AI
- [ ] `GROQ_API_KEY` configurato nei secrets
- [ ] Tutte le 11 edge functions AI deployate
- [ ] Test AI Coach (chat funzionante)
- [ ] Test generazione report (habit/trigger)

### Deploy
- [ ] Variabili d'ambiente configurate sul hosting
- [ ] Build di produzione riuscita (`npm run build`)
- [ ] Routing SPA configurato (rewrites per index.html)
- [ ] HTTPS attivo
- [ ] PWA funzionante (manifest, service worker, icone)

---

## 🆘 Troubleshooting

### "Invalid API Key" su Groq
- Verifica che la chiave sia corretta in Supabase → Edge Functions → Secrets
- Controlla che il nome del secret sia esattamente `GROQ_API_KEY`

### Google Login non funziona
- Verifica che il **Redirect URI** in Google Console sia: `https://<PROJECT_ID>.supabase.co/auth/v1/callback`
- Verifica che il provider Google sia **abilitato** in Supabase Auth
- Controlla che gli **Authorized JavaScript Origins** includano il tuo dominio

### Email di benvenuto non arrivano
- Verifica la configurazione SMTP in Supabase Dashboard → Authentication → SMTP Settings
- Per Gmail: assicurati di usare una **App Password** (non la password normale) e che la 2FA sia attiva
- Controlla la cartella spam/junk
- Verifica i limiti del provider (Gmail: 500/giorno, Supabase default senza SMTP: 2/ora)
- Prova a inviare un'email di test dal tuo provider SMTP per verificare che le credenziali funzionino

### Email di reset password non arrivano
- Stesse verifiche SMTP di sopra
- Assicurati che l'email sia effettivamente registrata nel sistema
- Controlla che il **Redirect URL** in Authentication → URL Configuration includa `https://tuodominio.com/reset-password`

### Reset password: "Link non valido o scaduto"
- Il link di reset scade dopo 1 ora — l'utente deve richiederne uno nuovo
- Verifica che il **Site URL** in Supabase corrisponda al dominio dell'app
- Assicurati che i redirect URL siano configurati correttamente (vedi Step 6.3)

### Stripe checkout non funziona
- Verifica che `STRIPE_API_KEY` sia configurato correttamente
- In sviluppo usa `sk_test_...`, in produzione `sk_live_...`
- Controlla i log della edge function nel Supabase Dashboard → Edge Functions → Logs

### Errore 404 su refresh delle pagine
- Configura i redirect per SPA (vedi Step 9 per Vercel/Netlify/Nginx)
- Tutte le route devono puntare a `/index.html`

### Database vuoto dopo le migrazioni
- Le migrazioni creano solo la **struttura**, non i dati
- Importa i dati esportati dal vecchio progetto (Step 2.4)

### Edge Function restituisce errore CORS
- Verifica che ogni edge function abbia gli header CORS configurati
- Controlla che il metodo OPTIONS sia gestito

---

## 📞 Risorse e Documentazione

- [Supabase Docs](https://supabase.com/docs) — Database, Auth, Edge Functions, Storage
- [Stripe Docs](https://stripe.com/docs) — Pagamenti, Checkout, Portale Clienti
- [Groq Docs](https://console.groq.com/docs) — API AI, Modelli, Limiti
- [Vite Docs](https://vitejs.dev) — Build tool, Configurazione
- [Vercel Docs](https://vercel.com/docs) — Deploy, Domini, Variabili d'ambiente
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2) — Setup OAuth

---

*Guida aggiornata il 24 Febbraio 2026*
