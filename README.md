# EPREL Comparator

Application moderne de comparaison de smartphones basée sur les données EPREL (European Product Registry for Energy Labelling) avec une architecture backend NestJS et frontend React séparés.

## 🏗️ Architecture

```
EPRELComparator/
├── src/                           # Application React (Frontend)
│   ├── components/               # Composants UI (shadcn/ui)
│   ├── services/                # Services API
│   └── comparator.tsx           # Composant principal
├── eprel-api-server-nestjs/     # API NestJS (Backend)
│   ├── src/
│   │   ├── main.ts              # Point d'entrée
│   │   ├── modules/eprel/       # Module EPREL
│   │   ├── common/              # Services partagés
│   │   └── config/              # Configuration
│   └── start-dev.sh             # Script de démarrage
└── package.json                 # Dépendances frontend
```

## ✨ Fonctionnalités

### Frontend (React + Vite + TypeScript)
- 🎨 Interface moderne avec shadcn/ui
- 📱 Design responsive
- 🔍 Recherche et filtrage par marque
- 📊 Comparaison jusqu'à 3 smartphones
- ⚡ React 19 optimisé

### Backend (NestJS + TypeScript)
- 🏗️ Architecture modulaire avec dependency injection
- 🔐 API sécurisée avec validation automatique
- 📚 Documentation Swagger interactive
- 🚀 Cache intelligent et rate limiting
- 🛡️ Gestion d'erreurs globale
- 📊 Monitoring et health checks

## 🚀 Démarrage Rapide

### Prérequis
- Node.js >= 18.0.0
- pnpm
- Clé API EPREL

### Installation et Configuration

Voir le guide complet dans **[SETUP-INSTRUCTIONS.md](./SETUP-INSTRUCTIONS.md)** pour les instructions détaillées.

**Résumé rapide :**

1. **Backend NestJS :**
   ```bash
   cd eprel-api-server-nestjs
   pnpm install
   cp .env.example .env
   # Configurer EPREL_API_KEY dans .env
   ./start-dev.sh
   ```

2. **Frontend React :**
   ```bash
   cd EPRELComparator
   pnpm install
   pnpm dev
   ```

## 🌐 URLs de l'Application

- **Frontend :** http://localhost:5173
- **API Backend :** http://localhost:3002
- **Documentation API Swagger :** http://localhost:3002/api/docs
- **Health Check :** http://localhost:3002/health

## 📡 API Endpoints

| Endpoint | Description | Documentation |
|----------|-------------|---------------|
| `GET /health` | État du serveur | Health check |
| `GET /api/docs` | Documentation Swagger | Interactive |
| `GET /api/brands` | Liste des marques | Swagger |
| `GET /api/smartphones` | Liste des smartphones | Swagger |
| `GET /api/smartphones/:id` | Smartphone par ID | Swagger |
| `GET /api/smartphones/search/:query` | Recherche | Swagger |

**Test rapide :**
```bash
curl http://localhost:3002/health
curl http://localhost:3002/api/brands
```

## 🛠️ Développement

### Scripts Frontend
```bash
pnpm dev          # Développement
pnpm build        # Build production
pnpm preview      # Aperçu build
```

### Scripts Backend NestJS
```bash
pnpm run start:dev    # Développement avec hot reload
pnpm run build        # Build TypeScript
pnpm run start:prod   # Production
pnpm run test         # Tests
```

## 🔒 Sécurité & Performance

### Sécurité
- ✅ Clé API EPREL protégée côté serveur
- ✅ CORS configuré pour origines spécifiques
- ✅ Rate limiting automatique
- ✅ Validation des paramètres avec class-validator
- ✅ Gestion d'erreurs sécurisée

### Performance
- ✅ Cache intelligent en mémoire
- ✅ Réduction des appels API EPREL
- ✅ Architecture modulaire optimisée
- ✅ Types TypeScript pour de meilleures performances

## 📊 Avantages de l'Architecture NestJS

### vs Express Original
- **Meilleure structure** : Modules, services, controllers organisés
- **Type safety** : TypeScript complet avec validation automatique
- **Documentation auto** : Swagger généré depuis le code
- **Tests intégrés** : Framework de test inclus
- **Scalabilité** : Patterns enterprise-ready

### Compatibility
- ✅ **API identique** : Aucun changement frontend requis
- ✅ **Mêmes endpoints** : Drop-in replacement
- ✅ **Configuration identique** : Variables d'environnement preservées

## 🚀 Déploiement

### Production
- **Frontend :** Vercel, Netlify, CDN
- **Backend :** Railway, Render, AWS, VPS
- **Documentation :** Swagger UI automatiquement déployée

### Configuration Production
```env
NODE_ENV=production
EPREL_API_KEY=votre-cle-production
ALLOWED_ORIGINS=https://votre-domain.com
```

## 📖 Documentation

- **Setup complet :** [SETUP-INSTRUCTIONS.md](./SETUP-INSTRUCTIONS.md)
- **Migration depuis Express :** [eprel-api-server-nestjs/MIGRATION.md](./eprel-api-server-nestjs/MIGRATION.md)
- **API interactive :** http://localhost:3002/api/docs

## 🐛 Support

Pour l'installation, configuration et dépannage, consultez **[SETUP-INSTRUCTIONS.md](./SETUP-INSTRUCTIONS.md)**.

**Debug rapide :**
```bash
# Vérifier l'état des services
curl http://localhost:3002/health
curl http://localhost:3002/api/cache/stats

# Documentation interactive
open http://localhost:3002/api/docs
```

## 📄 Licence

Ce projet est distribué sous la licence GPL 2.0. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

**Architecture moderne NestJS + React** offrant sécurité, performance et maintenabilité pour la comparaison de smartphones EPREL.