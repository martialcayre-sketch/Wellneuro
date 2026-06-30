# Roadmap Wellneuro NNPP2

## État livré (2026-06)

| Phase | Contenu | Statut |
|---|---|---|
| Phase 1 — MVP GAS | Questionnaires, scoring, interface patient/praticien, rappels, assignations | ✅ Livré |
| Phase 2 — Synthèse IA | Génération Claude, validation praticien, audit masqué, boucle notes | ✅ Livré |
| Phase 3 — Booklet | Génération HTML, prévisualisation, envoi manuel, anti-double envoi | ✅ Livré |
| Phase 4A — Ops dashboard | Compteurs, dernière activité, historique 20 événements | ✅ Livré |

## En cours — Stabilisation MVP GAS

- Validation payload questionnaire (submitQuestionnaire) — **fixé 2026-06-29**
- DEV_MULTI_ROLE_EMAILS contrôlé par ScriptProperties — **fixé 2026-06-29**
- Injection mini-corpus SIIN dans le prompt Claude
- Schéma Google Sheets à compléter

## En cours — Migration vers stack moderne (décision prise 2026-06-29)

Stratégie : migration progressive (strangler pattern), sans interruption du MVP GAS.
Cible retenue : **Next.js 14 + Google Auth (NextAuth) + Cloud Run + Cloud SQL PostgreSQL**.

| Lot | Contenu | Statut |
|---|---|---|
| Lot 0 — Scaffold Next.js | App web `web/`, auth Google, login page, dashboard praticien POC | ✅ Livré 2026-06-29 |
| Lot C2 — API lecture seule | Connexion métriques depuis Apps Script ou proxy | 🔲 À venir |
| Lot C3 — Patients & assignations | Pages lecture + création patients, assignation questionnaires | 🔲 À venir |
| Lot C4 — IA & Booklet | Synthèse IA, booklet, envoi dans nouvelle stack | 🔲 À venir |
| Lot C5 — Décommission GAS | Retrait progressif des endpoints Apps Script | 🔲 Futur |

## Hors périmètre (sauf demande explicite)

- Auth0 (remplacé par NextAuth + Google)
- Hébergement HDS (décision distincte, réglementaire)
- Import massif PDF SIIN / RAG vectoriel complet
- Coaching patient autonome
