# Studio personale dello studente — configurazione

La soluzione usa **Supabase Auth + PostgreSQL + Row Level Security**. Il sito resta principalmente statico e può continuare a essere pubblicato su Vercel/Netlify; Supabase gestisce autenticazione e dati personali.

## 1. Crea un progetto Supabase

Crea un progetto su Supabase e apri il **SQL Editor**.

Esegui integralmente:

`supabase-schema.sql`

Sono create quattro tabelle:

- `profiles`
- `bookmarks`
- `notes`
- `highlights`

Le policy RLS fanno sì che ogni studente possa leggere e modificare **solo i propri dati**.

## 2. Inserisci le chiavi pubbliche

Apri:

`assets/supabase-config.js`

Inserisci:

- Project URL
- anon/public key

**Non inserire mai la `service_role key` nel sito.**

## 3. Autenticazione

La pagina `login.html` permette:

- accesso;
- registrazione;
- recupero password.

Per l'uso scolastico puoi scegliere in Supabase se richiedere o meno la conferma dell'e-mail.

## 4. Funzioni disponibili

Su tutte le pagine dell'Atlante, quando l'utente è autenticato, compare il piccolo pannello **STUDIO**.

Lo studente può:

- selezionare testo e sottolinearlo;
- scegliere quattro colori;
- salvare la pagina come segnalibro;
- creare una nota;
- collegare una nota al testo selezionato;
- ritrovare tutto in `studio.html`.

Le sottolineature vengono salvate come **citazione testuale** associata alla pagina. Alla riapertura il sistema cerca quella citazione e la evidenzia nuovamente.

## 5. Spazio personale

`studio.html` mostra:

- numero dei segnalibri;
- numero delle sottolineature;
- numero delle note;
- numero delle pagine toccate;
- elenco dei segnalibri;
- elenco delle note;
- elenco delle sottolineature;
- attività recenti.

## 6. Dati personali

Il browser contiene solo la chiave anon/public di Supabase. L'accesso ai dati è controllato dal database tramite RLS.

Per un uso scolastico reale, prima della pubblicazione conviene definire con l'istituto le modalità di gestione degli account e dei dati degli studenti.


## Nuove funzioni del cruscotto
- **Il mio Atlante** mostra stato di esplorazione, segnalibri, sottolineature, note e pagine visitate.
- **Percorsi**: sei percorsi tematici con stazioni cliccabili e percentuale calcolata sulle pagine visitate.
- **Collega questo al resto**: catene concettuali cliccabili.
- **Ripassa**: trasforma le sottolineature in domande di ripasso e mostra il passaggio salvato.
- **Ricerca nelle annotazioni**: cerca nelle note e nelle sottolineature personali.
- **Esporta i miei dati**: crea un backup JSON personale.
- Le visite alle pagine vengono registrate nella tabella `page_visits`; rieseguire `supabase-schema.sql` per creare la tabella.
