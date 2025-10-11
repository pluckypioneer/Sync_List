# Plugin de synchronisation de marque-pages de navigateur basé sur GitHub

De nombreux utilisateurs trouvent fastidieux de synchroniser manuellement leurs marque-pages entre plusieurs navigateurs. Cet outil léger de synchronisation de marque-pages permet une synchronisation multiplateforme et multi-appareils. Il utilise un dépôt GitHub pour stocker et transférer le contenu des marque-pages, garantissant confidentialité et sécurité. Il est gratuit, facile à utiliser et aide à gérer les marque-pages sans effort, économisant temps et énergie.

## 🆕 Nouvelles fonctionnalités de la version

### 🎨 Optimisation de l'interface utilisateur
- **Interface moderne** : Design entièrement repensé avec des couleurs et une mise en page plus attrayantes
- **Indicateurs de statut** : Indicateurs de chargement et de statut en temps réel pour une meilleure expérience utilisateur
- **Design responsive** : Interface adaptée à différentes tailles d'écran
- **Animations fluides** : Transitions et animations améliorées pour une interaction plus naturelle

### 🔒 Renforcement de la sécurité
- **Chiffrement des données** : Chiffrement AES-256-GCM pour protéger vos marque-pages
- **Dérivation de clé sécurisée** : Utilise PBKDF2 avec 100 000 itérations
- **Gestion des mots de passe** : Système de gestion des mots de passe de chiffrement indépendant
- **Validation de l'intégrité** : Vérification automatique de l'intégrité des données

### 💾 Fonctionnalités de sauvegarde et de récupération
- **Sauvegarde locale** : Créez des sauvegardes locales de vos marque-pages
- **Récupération rapide** : Restaurez facilement vos marque-pages depuis une sauvegarde
- **Gestion des sauvegardes** : Interface intuitive pour gérer vos fichiers de sauvegarde
- **Protection des données** : Sauvegardes chiffrées pour une sécurité maximale

### 📊 Système de gestion des journaux
- **Journaux détaillés** : Enregistrement complet de toutes les opérations
- **Interface de visualisation** : Consultez facilement l'historique des opérations
- **Gestion des journaux** : Fonctionnalités de nettoyage et de gestion des journaux
- **Aide au dépannage** : Informations détaillées pour résoudre les problèmes

## Structure du répertoire

- icons —— Ressources d'icônes
- manifest.json —— Manifeste de configuration du plugin
- popup.html —— Page d'interaction principale
- popup.js —— Logique d'interaction principale
- options.html —— Page de paramètres
- options.js —— Logique de la page de paramètres
- cloudflare_worker.js —— Code du service backend

## 🚀 Fonctionnalités

### Fonctionnalités principales
- **Chiffrement des données** : Chiffrement AES-256-GCM de niveau militaire pour protéger vos marque-pages
- **Sauvegarde locale** : Créez et gérez des sauvegardes locales de vos marque-pages
- **Test de connexion** : Vérifiez la connectivité avec le serveur avant les opérations
- **Gestion des journaux** : Système de journalisation complet pour tracer toutes les opérations
- **Synchronisation sécurisée** : Téléversement et téléchargement sécurisés via GitHub

### Fonctionnalités avancées
- **Renforcement de la sécurité** : Gestion avancée des tokens et validation des données
- **Expérience utilisateur** : Interface moderne avec indicateurs de statut en temps réel
- **Gestion des erreurs** : Messages d'erreur détaillés et mécanismes de récupération
- **Configuration flexible** : Paramètres personnalisables pour différents besoins
- **Compatibilité multiplateforme** : Fonctionne sur Chrome, Edge et autres navigateurs Chromium
- **Protection de la vie privée** : Toutes les données sensibles sont chiffrées localement

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

## 📖 Utilisation

### Configuration de base
1. **Installation** : Après avoir installé le plugin, cliquez sur l'icône du plugin dans la barre d'outils du navigateur
2. **Configuration initiale** : Cliquez sur le bouton "Paramètres" et remplissez :
   - **URL de l'API Worker** : L'URL du Cloudflare Worker que vous avez déployé
   - **Jeton d'authentification** : La valeur de la variable d'environnement `AUTH_TOKEN` que vous avez définie
   - **Mot de passe de chiffrement** : Définissez un mot de passe fort pour chiffrer vos données (optionnel mais recommandé)
3. **Test de connexion** : Cliquez sur "Tester la connexion" pour vérifier que la configuration est correcte
4. **Enregistrement** : Cliquez sur "Enregistrer les paramètres"

### Synchronisation des marque-pages
- **Téléversement** : Utilisez "Téléverser les marque-pages" pour synchroniser les marque-pages locales avec GitHub
- **Téléchargement** : Utilisez "Télécharger les marque-pages" pour synchroniser depuis GitHub (remplacera les marque-pages locales)
- **Chiffrement automatique** : Si un mot de passe de chiffrement est défini, les données seront automatiquement chiffrées

### Gestion des sauvegardes
- **Créer une sauvegarde** : Cliquez sur "Créer une sauvegarde" pour sauvegarder localement vos marque-pages
- **Restaurer depuis une sauvegarde** : Utilisez "Restaurer depuis une sauvegarde" pour récupérer vos marque-pages
- **Sauvegardes chiffrées** : Les sauvegardes sont automatiquement chiffrées si un mot de passe est défini

### Consultation des journaux
- **Afficher les journaux** : Cliquez sur "Voir les journaux" pour consulter l'historique des opérations
- **Nettoyer les journaux** : Utilisez "Effacer les journaux" pour supprimer l'historique
- **Informations détaillées** : Les journaux incluent les horodatages, statuts et messages d'erreur

### Conseils de sécurité
- **Mot de passe fort** : Utilisez un mot de passe de chiffrement complexe et unique
- **Sauvegarde régulière** : Créez des sauvegardes locales avant les opérations importantes
- **Vérification des journaux** : Consultez régulièrement les journaux pour détecter les anomalies

## ⚠️ Remarques importantes

### Configuration
- Lors de la configuration des variables d'environnement du Worker, **vérifiez attentivement** que le contenu est correct
- Assurez-vous que votre Worker Cloudflare est accessible depuis Internet
- Testez toujours la connexion après la configuration initiale
- Gardez vos tokens et mots de passe en sécurité

### Sécurité des données
- Le téléchargement des marque-pages remplacera tous les marque-pages locaux ; veuillez opérer avec prudence
- Il est fortement recommandé de définir un mot de passe de chiffrement pour protéger vos données
- Créez des sauvegardes locales avant toute opération importante
- Un dépôt privé peut mieux protéger la confidentialité de vos marque-pages

### Fonctionnalités de chiffrement
- **Première utilisation** : Définissez un mot de passe de chiffrement fort lors de la première configuration
- **Cohérence des mots de passe** : Utilisez le même mot de passe sur tous vos appareils pour la synchronisation
- **Sauvegarde du mot de passe** : Conservez votre mot de passe de chiffrement en sécurité - il ne peut pas être récupéré
- **Téléversement initial** : Lors de la première utilisation, téléversez d'abord vos marque-pages locales
- **Sauvegardes chiffrées** : Les sauvegardes locales sont automatiquement chiffrées avec votre mot de passe

## ❓ Questions fréquemment posées

### Q : Que faire si le téléversement / le téléchargement échoue ?

R : Vérifiez d'abord la connexion en cliquant sur "Tester la connexion", puis consultez les journaux en cliquant sur "Voir les journaux". Les raisons courantes incluent :

- Configuration incorrecte de l'adresse Worker ou du jeton d'authentification
- Permissions insuffisantes ou jeton GitHub expiré
- Problèmes de connexion réseau
- Dépôt ou fichier GitHub inexistant
- **Mot de passe de chiffrement incorrect** (si le chiffrement est activé)

### Q : Comment obtenir un jeton d'accès personnel GitHub ?

R : Visitez la [page de paramètres des jetons GitHub](https://github.com/settings/tokens), cliquez sur "Generate new token", cochez la permission `repo`, générez le jeton et conservez-le en sécurité.

### Q : Peut-il être utilisé sur plusieurs appareils ?

R : Oui, installez le plugin sur chaque appareil et configurez la même adresse Worker, le même jeton d'authentification **et le même mot de passe de chiffrement** pour réaliser une synchronisation multi-appareils.

### Q : Que faire si j'oublie mon mot de passe de chiffrement ?

R : Malheureusement, le mot de passe de chiffrement ne peut pas être récupéré. Vous devrez :
1. Effacer les données chiffrées existantes
2. Redéfinir un nouveau mot de passe de chiffrement
3. Téléverser à nouveau vos marque-pages locales

### Q : Où sont stockés les fichiers de sauvegarde ?

R : Les sauvegardes sont téléchargées dans le dossier de téléchargement par défaut de votre navigateur. Les fichiers sont nommés avec un horodatage pour faciliter l'identification.

### Q : Comment consulter les journaux d'opération ?

R : Cliquez sur le bouton "Voir les journaux" dans l'interface du plugin pour consulter l'historique détaillé des opérations, incluant les succès, échecs et informations d'erreur.

## 🔧 Caractéristiques techniques

### Technologies de sécurité
- **Chiffrement AES-256-GCM** : Algorithme de chiffrement symétrique de niveau industriel
- **Dérivation de clé PBKDF2** : 100 000 itérations pour renforcer la sécurité du mot de passe
- **Valeurs de sel aléatoires** : Différentes valeurs de sel utilisées pour chaque chiffrement
- **Vérification d'intégrité** : Le mode GCM fournit une protection de l'intégrité des données

### Conception architecturale
- **Structure de code modulaire** : Utilise des classes et une conception modulaire pour faciliter la maintenance
- **Mécanisme de gestion des erreurs** : Capture d'erreurs complète et messages conviviaux
- **Gestion d'état** : Mises à jour d'état de l'interface utilisateur en temps réel et indicateurs de chargement
- **Validation des données** : Validation des données multicouche pour garantir l'intégrité des données

## 📋 Journal des mises à jour de version

### v2.0.0 (Version actuelle)
- ✨ Ajout de la fonctionnalité de chiffrement des données (AES-256-GCM)
- ✨ Ajout des fonctionnalités de sauvegarde et de récupération locales
- ✨ Ajout du système de gestion des journaux détaillés
- ✨ Ajout de la fonctionnalité de test de connexion
- 🎨 Conception d'interface utilisateur entièrement nouvelle
- 🔒 Sécurité renforcée et gestion des tokens
- 🐛 Correction de plusieurs problèmes connus
- 📱 Amélioration du design responsive

### v1.0.0
- 🎉 Fonctionnalités de base de synchronisation des marque-pages
- 📤 Téléversement des marque-pages vers GitHub
- 📥 Téléchargement des marque-pages depuis GitHub
- ⚙️ Gestion de configuration de base

## 📄 Licence

[GNU General Public License v3.0](https://github.com/pluckypioneer/Sync_List/blob/main/LICENSE)

## ⚠️ Avertissement

- Ce plugin est uniquement destiné à des fins d'apprentissage et d'utilisation personnelle ; veuillez assurer la sécurité de vos données
- Il est recommandé de définir le dépôt de marque-pages comme privé pour protéger la vie privée
- Bien que les fonctionnalités de chiffrement offrent une protection de sécurité supplémentaire, veuillez garder votre mot de passe de chiffrement en sécurité
- L'auteur n'est pas responsable de toute perte de données causée par l'utilisation de ce plugin

## 🤝 Contribution

Bienvenue pour soumettre des Issues et des Pull Requests pour améliorer ce projet !

## 📞 Contact

Si vous avez des questions ou des suggestions, n'hésitez pas à :
- Soumettre une [GitHub Issue](https://github.com/pluckypioneer/Sync_List/issues)
- Créer une [Pull Request](https://github.com/pluckypioneer/Sync_List/pulls)

---

⭐ Si ce projet vous aide, veuillez lui donner une étoile pour le soutenir !
