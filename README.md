# FLAMIORA

Site vitrine et e-commerce FLAMIORA. HTML/CSS/JavaScript vanilla avec Firebase (Firestore + Authentication). Aucune étape de build : le site s'exécute directement depuis ces fichiers statiques.

## Structure

- `index.html`, `produits.html`, `produit.html`, `panier.html`, `commande.html`, `a-propos.html`, `contact.html`, `404.html`
- `merci.html` — ancienne page de remerciement, plus utilisée dans le tunnel de commande (voir « Fonctionnement des commandes » ci-dessous). Conservée telle quelle sur le disque au cas où une ancienne commande/lien externe y pointerait encore, mais rien ne redirige plus vers elle.
- `admin.html` — panneau d'administration (produits, catégories, commandes)
- `assets/css/style.css` — styles du site
- `assets/css/admin.css` — styles du panneau d'administration
- `assets/js/firebase-config.js` — configuration Firebase (clé publique, non secrète)
- `assets/js/i18n.js` — traductions AR/FR
- `assets/js/products-loader.js` — chargement des produits/catégories depuis Firestore (avec repli sur des données de démarrage si Firestore est vide ou injoignable)
- `assets/js/main.js` — panier (localStorage), WhatsApp, logique partagée entre les pages
- `assets/js/admin.js` — authentification et gestion des produits, catégories et commandes
- `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.firebaserc` — configuration Firebase Hosting / Firestore (projet `flamiora-cbb24`)

## Configuration requise avant le premier lancement

1. **Créer le compte administrateur** — Dans la Console Firebase du projet `flamiora-cbb24` → *Authentication* → *Users* → ajoutez un utilisateur avec l'adresse `flamiora.accessoires@gmail.com` et un mot de passe. C'est la seule adresse autorisée par `firestore.rules` et par `admin.js` (aucune vérification d'e-mail requise pour se connecter).
2. **Déployer les règles et index Firestore** :
   ```
   firebase deploy --only firestore:rules,firestore:indexes
   ```
3. **Ajouter les catégories et produits réels** dans Firestore via `admin.html` (les données visibles au premier chargement sont des données de secours locales, utilisées uniquement si Firestore est vide).

## Déploiement du site

```
firebase deploy
```

Cela publie l'ensemble du dossier (Firebase Hosting) ainsi que les règles/index Firestore, selon `firebase.json`.

Le site fonctionne aussi tel quel sur GitHub Pages (tous les chemins sont relatifs), mais dans ce cas seul l'hébergement des fichiers statiques est assuré par GitHub — Firestore/Authentication restent gérés par le projet Firebase `flamiora-cbb24`.

## Fonctionnement des commandes

Le paiement se fait uniquement à la livraison (COD). Le bouton « Envoyer la commande » (`commande.html` et le checkout rapide de `panier.html`) est un vrai lien `<a>` (pas un redirect JavaScript) : un seul tap l'envoie directement vers WhatsApp dans un nouvel onglet, ce qui reste fiable même dans Safari iOS et les navigateurs intégrés (Instagram/Facebook), qui bloquent souvent les redirections déclenchées par script mais laissent toujours passer un vrai clic sur un lien. Au moment de la commande :
- Le message récapitulatif part vers WhatsApp (numéro configuré dans `assets/js/main.js`) dès ce tap — c'est le canal de confirmation garanti.
- En parallèle, sans bloquer ni retarder l'ouverture de WhatsApp, la commande est enregistrée dans la collection Firestore `orders` (visible et gérable depuis `admin.html` → *Commandes*), même si cette écriture échoue (ex. cliente hors ligne).
- La page reste sur place et affiche une confirmation intégrée (`commande.html`) ou revient simplement à un panier vide (`panier.html`) — il n'y a plus de page « merci » séparée à ouvrir en plus.



## لوحة التحكم والتحليلات

لوحة `admin.html` تحتوي الآن على: نظرة عامة، تحليلات سلوك الزبائن، إدارة المنتجات والفئات، إدارة الطلبات، وإعدادات المتجر. يتم تسجيل أحداث تسوق مجهولة فقط في `analytics_events` مثل مشاهدة المنتج، البحث، الإضافة للسلة، فتح checkout، وإتمام الطلب. لا يتم تسجيل الاسم أو الهاتف أو العنوان في التحليلات.

التقرير اليومي يُحسب من أحداث اليوم داخل لوحة التحكم، ويمكن اختيار 7 أو 30 يومًا وتصدير الأحداث إلى CSV.
