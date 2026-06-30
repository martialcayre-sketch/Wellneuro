# Contexte + prompt — mise en place locale strictement identique

## Objectif

Obtenir sur un PC local (VS Code) un environnement aussi proche que possible de Codespaces pour le dépôt Wellneuro.

## Contexte projet (à conserver)

- Projet: Wellneuro NNPP2 (MVP Google Apps Script).
- Priorité: stabiliser le MVP GAS, sans migration technique.
- Ne jamais committer de secrets (`.env` réels, `.clasp.json`, `.clasprc.json`, tokens).
- Ne jamais écrire `SHEET_ID` en dur (lecture uniquement via Script Properties).
- Vérification sécurité avant commit: `bash scripts/check_no_secrets.sh` (ou `npm run check:secrets`).

## Prompt prêt à copier

```text
Contexte:
Je veux reproduire localement sur mon PC (VS Code) un environnement strictement identique à Codespaces pour le repo Wellneuro.
Le repo est un MVP Google Apps Script, priorité stabilité, pas de migration.

Contraintes obligatoires:
- changements minimaux et réversibles;
- aucun secret committé (.env réel, .clasp.json, .clasprc.json, clés/tokens);
- jamais de SHEET_ID en dur;
- conserver les textes UI en français.

Tâche:
1) Donne une procédure pas à pas pour obtenir la parité stricte (option Dev Container en priorité).
2) Donne une alternative native locale si Docker n’est pas disponible.
3) Fournis une checklist de validation finale pour confirmer la parité.

Validation attendue:
- commandes exactes à exécuter;
- vérification versions (node, npm, clasp);
- vérification dépendances (npm ci);
- vérification git (même branche/même commit);
- contrôle sécurité final: bash scripts/check_no_secrets.sh.

Format de réponse:
- sections courtes et actionnables;
- pas de blabla;
- checklist finale claire.
```

## Résultat attendu

Après application du prompt, l’environnement local doit être aligné sur:

- le même commit Git,
- les mêmes versions d’outils,
- les mêmes dépendances,
- les mêmes contrôles sécurité,
- la même configuration Apps Script locale (sans exposer de secrets).
