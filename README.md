# 🎂 Joyeux Anniversaire Ma Lauvia

Une carte d'anniversaire interactive et cinématographique : ciel nocturne
vivant, introduction en fondu, chargement premium, révélation du titre lettre
par lettre, message écrit à la machine, vidéo, bouton piège des 10 000 FCFA et
un final en feux d'artifice.

Construit avec **React 19 · Vite · TypeScript · Tailwind CSS · Framer Motion ·
canvas-confetti · Lucide**.

---

## ✨ Lancer le projet en local

Il te faut **Node.js 18+** (idéalement 20 ou 22).

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur de développement
npm run dev
```

Ouvre ensuite l'adresse affichée (par défaut **http://localhost:5173**).

> 💡 La musique ne démarre qu'après le premier clic sur le bouton « Clique ici »
> (les navigateurs bloquent le son automatique). C'est voulu et normal.

Autres commandes :

```bash
npm run build     # build de production dans /dist
npm run preview   # prévisualiser le build de production
```

---

## 🚀 Héberger sur Vercel

### Option A — depuis GitHub (recommandé)

1. Crée un dépôt GitHub et pousse ce dossier :
   ```bash
   git init
   git add .
   git commit -m "Surprise anniversaire"
   git branch -M main
   git remote add origin https://github.com/TON_COMPTE/TON_DEPOT.git
   git push -u origin main
   ```
2. Va sur **vercel.com → Add New → Project**, importe le dépôt.
3. Vercel détecte automatiquement Vite. Laisse les réglages par défaut :
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
4. Clique **Deploy**. Tu obtiens un lien du type
   `https://ton-projet.vercel.app` à partager. 🎉

### Option B — sans GitHub (Vercel CLI)

```bash
npm i -g vercel   # une seule fois
vercel            # suivre les questions, puis
vercel --prod     # déploiement final
```

Le fichier `vercel.json` est déjà configuré, tu n'as rien d'autre à faire.

---

## 🖼️ Remplacer les médias

- **Vidéo** : `public/media/surprise-video.mp4`
- **Musique** : `public/media/background-music.mp3`

Garde les mêmes noms de fichiers et tout continue de fonctionner.

## 📝 Modifier les textes

Tout le contenu (titre, message, répliques du bouton piège, final) est
centralisé dans **`src/config/content.ts`**.

---

## 📁 Structure

```
src/
  components/
    background/   NightSky · FloatingElements · PointerFX
    scenes/       IntroScene · LoadingScene · ExperienceScene
    ui/           GlassButton · MusicToggle · AnimatedTitle ·
                  Typewriter · VideoCard · RunawayButton
  hooks/          useAudio · useReducedMotion · useIsTouch
  animations/     celebrations · variants
  config/         content.ts
  utils/          cn · random
  styles/         index.css
  App.tsx · main.tsx
```

Bon anniversaire à Lauvia ❤️
