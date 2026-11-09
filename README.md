# Acrosport EPS — mode d'emploi de l'hébergement

Ce dossier contient tout ce qu'il faut pour mettre l'application en ligne :

| Fichier | Rôle |
|---|---|
| `index.html` | l'application (figures, photos, enchaînement, tapis, observation) |
| `v/` | les 176 vidéos d'origine du PowerPoint |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | rendent l'appli installable sur tablette et utilisable sans internet |
| `apps-script/Code.gs` | le petit serveur qui enregistre la progression des groupes dans une Google Sheet |

---

## 1. Mettre l'application en ligne (GitHub Pages, gratuit)

1. Crée un compte sur **github.com** (gratuit).
2. Bouton **New repository** → nom : `acrosport` → **Public** → *Create repository*.
3. Clique sur **uploading an existing file** et glisse **tout le contenu** de ce dossier (pas le dossier lui-même : `index.html` doit être à la racine). Valide avec **Commit changes**.
   *Les 176 vidéos passent en plusieurs fois si besoin (GitHub accepte 100 fichiers par envoi depuis le navigateur).*
4. **Settings → Pages** → *Source* : **Deploy from a branch** → *Branch* : `main` / `(root)` → **Save**.
5. Une ou deux minutes plus tard, l'adresse apparaît : `https://TON-PSEUDO.github.io/acrosport/`

C'est ce lien que tu ouvres sur les tablettes.

## 2. Installer l'appli sur les tablettes

Sur chaque tablette Android, ouvre le lien dans **Chrome** → menu **⋮** → **Installer l'application** (ou *Ajouter à l'écran d'accueil*).
L'icône Acrosport apparaît comme une vraie appli, en plein écran.

**Sans internet au gymnase ?** Espace enseignant (⚙, code `eps`) → **Télécharger les vidéos** : les 176 vidéos sont copiées dans la tablette (≈ 170 Mo), une fois pour toutes.

**Mises à jour :** à chaque modification publiée sur GitHub, les tablettes reçoivent la nouvelle version à la prochaine ouverture avec internet. Rien à réinstaller.

**Vraiment un fichier .apk ?** Va sur **pwabuilder.com**, colle l'adresse de l'appli → *Package for stores* → **Android** → télécharge l'APK. Cet APK ouvre ton site : les mises à jour arrivent toujours toutes seules, sans refaire d'APK.

## 3. Activer l'enregistrement en ligne (Google Sheet)

1. Sur **Google Drive**, crée une **Google Sheet** vide nommée « Acrosport – progression ».
2. Menu **Extensions → Apps Script**. Efface le contenu et colle tout le fichier `apps-script/Code.gs`.
3. Ligne 13, remplace `change-moi` par **ton mot de passe enseignant** (garde-le pour toi). 💾 Enregistre.
4. **Déployer → Nouveau déploiement** → roue ⚙ → **Application Web**
   - *Exécuter en tant que* : **Moi**
   - *Qui a accès* : **Tout le monde**
   → **Déployer** → autorise l'accès à ton compte Google (écran « application non validée » : *Paramètres avancés* → *Accéder au projet*).
5. Copie l'**URL de l'application Web** (elle se termine par `/exec`).
6. Dans l'appli : ⚙ → **En ligne** → colle l'URL → **Tester la connexion** → **Enregistrer les réglages**.
   *(Plus simple : donne-moi cette URL, je l'inscris directement dans l'appli et elle sera réglée sur toutes les tablettes.)*

### Comment ça marche ensuite
- **Accueil** : l'élève touche sa **classe**, choisit son **groupe** dans la liste (ou le crée avec « + Créer un nouveau groupe » : nom, mot de passe, prénoms), tape le **mot de passe** et entre. Les groupes de la classe sont affichés en bas de l'accueil.
- **Enregistrer ma progression** envoie tout en ligne. Si la tablette n'a pas de réseau, c'est gardé et **envoyé automatiquement** dès que la connexion revient (le badge en haut indique « ⏳ Envoi dès connexion » puis « ☁ En ligne ✓ »).
- **Observation** : le groupe choisit le **groupe observé** → son enchaînement enregistré (pyramides, rôles, transitions) s'affiche avec les critères en colonnes (Porteur / Voltigeur / Pareur, puis Collectif et Sécurité). On coche les observateurs, on note, puis **Enregistrer l'observation**.
- **Toi** : ⚙ → **En ligne** → ton mot de passe enseignant →
  - **Voir tous les groupes en ligne** : **Ouvrir** (tu peux tout modifier puis enregistrer) ou **Mot de passe** (si un groupe l'a oublié) ;
  - **Voir les observations** : tableau *qui a observé qui*, date, critères réussis, nombre d'erreurs de sécurité, détail complet avec **Voir**.
- La Google Sheet contient deux onglets : **Groupes** et **Observations** (qui a observé qui, quand, résultat, erreurs de sécurité nommées). Les mots de passe n'y sont jamais en clair.
- Seuls les prénoms des élèves sont enregistrés, dans ton propre Google Drive.
- Les classes proposées à l'accueil (TMELEC, TTBMA) se changent dans ⚙ → **Classes**.

Si tu modifies `Code.gs` plus tard : **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version** (l'URL ne change pas).
