# Plugin de synchronisation de marque-pages de navigateur basé sur GitHub

De nombreux utilisateurs trouvent fastidieux de synchroniser manuellement leurs marque-pages entre plusieurs navigateurs. Cet outil léger de synchronisation de marque-pages permet une synchronisation multiplateforme et multi-appareils. Il utilise un dépôt GitHub pour stocker et transférer le contenu des marque-pages, garantissant confidentialité et sécurité. Il est gratuit, facile à utiliser et aide à gérer les marque-pages sans effort, économisant temps et énergie.

## Structure du répertoire

- icons —— Ressources d'icônes
- manifest.json —— Manifeste de configuration du plugin
- popup.html —— Page d'interaction principale
- popup.js —— Logique d'interaction principale
- options.html —— Page de paramètres
- options.js —— Logique de la page de paramètres
- cloudflare_worker.js —— Code du service backend

## Fonctionnalités

- Téléversement en un clic des marque-pages locaux vers un dépôt GitHub
- Téléchargement des marque-pages depuis un dépôt GitHub et remplacement des marque-pages locaux
- Gestion complète des erreurs et messages à l'utilisateur
- Mécanisme d'authentification sécurisé
- Enregistrement des logs d'opération, facilitant le dépannage
- Prise en charge des configurations personnalisées

## Méthode d'installation

1. Clonez ce dépôt sur votre machine locale
2. Ouvrez le navigateur Chrome/Edge et accédez à `chrome://extensions/` ou `edge://extensions/`
3. Activez le "Mode développeur"
4. Cliquez sur "Charger l'extension décompressée" et sélectionnez le dossier racine de ce dépôt

## Préparation

### 1. Préparer un dépôt GitHub

1. Créez un nouveau dépôt GitHub (il est recommandé de le définir comme privé pour une meilleure sécurité)
2. Créez un fichier dans le dépôt pour stocker les marque-pages (par exemple `bookmarks.json`)

### 2. Déployer un Cloudflare Worker

1. Inscrivez-vous / connectez-vous à votre compte Cloudflare [Visitez Cloudflare](https://dash.cloudflare.com)
2. Dans la barre latérale gauche, sélectionnez `Workers & Pages` sous `Compute`, cliquez sur le bouton en haut à droite pour créer un nouveau Worker, et choisissez `Commencer avec Hello World!` pour déployer directement le worker
3. Ouvrez l'interface de gestion du worker déployé, cliquez sur "Éditer le code" en haut à droite, et copiez le code de `cloudflare_worker.js` dans l'éditeur du Worker
4. Configurez les variables d'environnement du Worker :
   - `GITHUB_TOKEN` : Jeton d'accès personnel GitHub (nécessite la permission `repo`)
   - `GITHUB_REPO_OWNER` : Nom d'utilisateur GitHub
   - `GITHUB_REPO_NAME` : Nom du dépôt stockant les marque-pages
   - `GITHUB_FILE_PATH` : Chemin du fichier stockant les marque-pages (par exemple `bookmarks.json`)
   - `AUTH_TOKEN` : Jeton d'authentification personnalisé (pour l'accès du plugin au Worker)
Méthode de configuration : Depuis l'interface de gestion du Worker du projet sur Cloudflare, sélectionnez "Paramètres" -> "Variables" -> "Variables d'environnement" -> "Ajouter une variable" en haut à droite. Conservez le type par défaut `Texte`, et entrez le `Nom de la variable d'environnement` et la `Valeur` correspondants (notez que les noms de variables d'environnement doivent être en majuscules ; il est recommandé de copier directement les noms depuis le README ci-dessus pour éviter les erreurs).
5. Déployez le Worker et notez l'URL attribuée (par exemple `https://bookmark-sync.yourname.workers.dev`)

## Utilisation

1. Après avoir installé le plugin, cliquez sur l'icône du plugin dans la barre d'outils du navigateur
2. Cliquez sur le bouton "Paramètres" et remplissez :
   - URL de l'API Worker : L'URL du Cloudflare Worker que vous avez déployé
   - Jeton d'authentification : La valeur de la variable d'environnement `AUTH_TOKEN` que vous avez définie
3. Cliquez sur "Enregistrer les paramètres"
4. Utilisez le bouton "Téléverser les marque-pages" pour synchroniser les marque-pages locales avec GitHub
5. Utilisez le bouton "Télécharger les marque-pages" pour synchroniser les marque-pages depuis GitHub vers le local (remplacera les marque-pages locales)

## Remarques

- Lors de la configuration des variables d'environnement du Worker, **vérifiez attentivement** que le contenu est correct !!!
- Le téléchargement des marque-pages remplacera tous les marque-pages locaux ; veuillez opérer avec prudence
- Il est recommandé de sauvegarder régulièrement les marque-pages pour prévenir toute perte accidentelle
- Lors de la première utilisation, il est conseillé de téléverser d'abord les marque-pages locales pour s'assurer que les données sont stockées en toute sécurité
- Un dépôt privé peut mieux protéger la confidentialité de vos marque-pages

## Questions fréquemment posées

### Q : Que faire si le téléversement / le téléchargement échoue ?

R : Vérifiez les messages d'erreur dans la fenêtre contextuelle du plugin. Les raisons courantes incluent :

- Configuration incorrecte de l'adresse Worker ou du jeton d'authentification
- Permissions insuffisantes ou jeton GitHub expiré
- Problèmes de connexion réseau
- Dépôt ou fichier GitHub inexistant

### Q : Comment obtenir un jeton d'accès personnel GitHub ?

R : Visitez la [page de paramètres des jetons GitHub](https://github.com/settings/tokens), cliquez sur "Generate new token", cochez la permission `repo`, générez le jeton et conservez-le en sécurité.

### Q : Peut-il être utilisé sur plusieurs appareils ?

R : Oui, installez le plugin sur chaque appareil et configurez la même adresse Worker et le même jeton d'authentification pour réaliser une synchronisation multi-appareils.

## Licence

[GNU General Public License v3.0](https://github.com/pluckypioneer/Sync_List/blob/main/LICENSE)

## Avertissement

- Ce plugin est uniquement destiné à des fins d'apprentissage et d'utilisation personnelle ; veuillez assurer la sécurité de vos données.
- Il est recommandé de définir le dépôt de marque-pages comme privé pour protéger la vie privée.

---

Si vous avez des questions ou des suggestions, n'hésitez pas à soumettre une issue ou à contacter l'auteur.
