# Parité VS Code local ↔ Codespaces — Wellneuro-app

Objectif : reproduire exactement l'environnement Codespaces sur le PC local (même image, mêmes dépendances, mêmes extensions, mêmes settings, même port forwarding).

## Architecture du projet

Le projet comporte deux couches actives en parallèle :

| Couche | Dossier | Stack |
|---|---|---|
| MVP GAS | `src/gas/` | Google Apps Script (clasp) |
| App web | `web/` | Next.js 14 + TypeScript + Tailwind CSS |

## Option A — parité parfaite via Dev Container (recommandée)

Prérequis :
- VS Code (stable)
- Docker Desktop (ou Docker Engine)
- Extension `ms-vscode-remote.remote-containers`

Procédure :

```bash
git clone https://github.com/martialcayre-sketch/Wellneuro.git Wellneuro-app
cd Wellneuro-app
code .
# Puis : Dev Containers: Reopen in Container
```

Ce que `.devcontainer/devcontainer.json` applique automatiquement :

| Paramètre | Valeur |
|---|---|
| Image | `mcr.microsoft.com/devcontainers/javascript-node:20` |
| Bootstrap | `npm install -g @google/clasp && cd web && npm install` |
| Port forwardé | `3000` (Next.js dev, avec notification auto) |
| Extensions auto-installées | Prettier, ESLint, Tailwind CSS IntelliSense |
| Variable d'env | `NODE_ENV=development` |

Vérification post-démarrage :

```bash
node -v          # doit afficher v20.x
npm -v
clasp -v         # doit afficher 3.x
bash scripts/check_no_secrets.sh
cd web && npm run type-check
```

## Option B — environnement natif (si Docker indisponible)

Prérequis :
- Node.js 20.x
- `@google/clasp` global
- GitHub CLI (`gh`) optionnel

```bash
npm install -g @google/clasp
cd web && npm install
clasp login
```

Configuration clasp locale :
1. Copier `.clasp.example.json` → `.clasp.json`
2. Renseigner le `scriptId` réel
3. Vérifier `"rootDir": "src/gas"`

Extensions VS Code à installer manuellement :
- `esbenp.prettier-vscode`
- `dbaeumer.vscode-eslint`
- `bradlc.vscode-tailwindcss`
- `github.copilot` + `github.copilot-chat`

## Settings VS Code — source de vérité

`.vscode/settings.json` est la source de vérité appliquée dans **les deux environnements** (Codespaces ouvre le dossier directement, pas le fichier `.code-workspace`).

`Wellneuro-app.code-workspace` reprend les mêmes settings + ajoute les tâches de raccourci. Utiliser ce fichier en local pour accéder aux tâches depuis la palette.

## Tâches disponibles (palette VS Code > Run Task)

| Tâche | Commande |
|---|---|
| `bootstrap-local` | Installe clasp global + dépendances web |
| `dev-web` | Lance Next.js en mode dev (port 3000) |
| `type-check` | Vérifie les types TypeScript du projet web |
| `check-no-secrets` | Contrôle sécurité avant commit |
| `deploy-gas` | Déploie le code GAS via clasp |

## Lancer l'app web en dev

```bash
cd web && npm run dev
# Puis ouvrir http://localhost:3000
```

En Codespaces, le port 3000 est forwardé automatiquement avec une notification.

## Routine avant tout commit

```bash
bash scripts/check_no_secrets.sh
git diff
clasp status
```

## Définition de la parité parfaite

- Même image Node 20 (via Dev Container)
- Mêmes dépendances (`web/node_modules` installé au bootstrap)
- Même port 3000 forwardé
- Mêmes extensions VS Code (Prettier, ESLint, Tailwind)
- Mêmes settings éditeur (EOL, tabulations, formatage, ESLint TS)
- Même workflow clasp et scripts de sécurité
