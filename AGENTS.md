# Instructions agents IA/Codex — NutriConsult NNPP2

## Architecture actuelle

Le dépôt est un MVP Google Apps Script :

- `src/gas/Code.gs` : backend Apps Script.
- `src/gas/Questions.gs` : catalogue des questionnaires et scoring.
- `src/gas/index.html` : interface française patient/praticien.
- Google Sheets sert de base de données.

Ne pas commencer de migration Next.js, PostgreSQL, Auth0 ou hébergement HDS sans demande explicite. La priorité est la validation end-to-end du MVP GAS.

## Règles de sécurité

- Interdiction absolue d'écrire un identifiant Google Sheets en dur.
- Récupérer le Sheet ID uniquement avec :
  `PropertiesService.getScriptProperties().getProperty('SHEET_ID')`.
- Ne jamais committer : données patients réelles, identifiants Google, clés API, `.env` réel, exports CSV/XLSX, résultats biologiques réels, questionnaires remplis réels.
- Patients fictifs autorisés pour tests : Sophie Nicola, Jennifer Martin, Michel Dogné.

## Règles cliniques et scoring

- Ne pas modifier la logique clinique existante sans demande explicite.
- Ne pas modifier les seuils de scoring sans source et documentation.
- Ne pas inventer de questionnaire, score, seuil ou recommandation clinique.
- Toute modification clinique doit être documentée dans `CHANGELOG.md` et dans la documentation concernée.

## Style de code

- Interface et textes utilisateur en français.
- Code lisible pour un praticien non-développeur.
- Fonctions courtes, noms explicites, commentaires utiles.
- Pas de dépendance inutile.
- Ne pas entourer les imports par des blocs try/catch.

## Commandes de vérification

- `bash scripts/check_no_secrets.sh`
- `git status --short`
- Vérification manuelle end-to-end selon `docs/checklist_tests_end_to_end.md`.
