/**
 * Acrosport EPS — sauvegarde en ligne des groupes
 * À coller dans Google Apps Script (Extensions > Apps Script depuis une Google Sheet).
 *
 * 1. Remplace MOT_DE_PASSE_PROF ci-dessous par ton mot de passe enseignant.
 * 2. Déployer > Nouveau déploiement > Application Web
 *      Exécuter en tant que : Moi
 *      Qui a accès : Tout le monde
 * 3. Copie l'URL qui se termine par /exec et colle-la dans l'appli (Espace enseignant > En ligne).
 *
 * Les mots de passe ne sont jamais enregistrés en clair : seule une empreinte (SHA-256 + sel) est gardée.
 */
const MOT_DE_PASSE_PROF = 'change-moi';
const ONGLET = 'Groupes';
const TAILLE_MORCEAU = 45000; // une cellule Google Sheets accepte 50 000 caractères maximum
const COLONNES = ['cle', 'classe', 'nom', 'membres', 'empreinte', 'sel', 'mise_a_jour', 'nb_seances'];

function doGet() {
  return json_({ ok: true, app: 'acrosport' });
}

function doPost(e) {
  let reponse;
  try {
    const req = JSON.parse(e.postData.contents);
    reponse = traiter_(req);
  } catch (err) {
    reponse = { ok: false, error: String(err && err.message || err) };
  }
  return json_(reponse);
}

function traiter_(req) {
  const a = req.action;
  if (a === 'ping') return { ok: true };

  if (a === 'create') {
    return verrou_(function () {
      const cle = cle_(req.classe, req.nom);
      if (!req.password || String(req.password).length < 4) throw new Error('Mot de passe trop court (4 caractères minimum)');
      if (trouver_(cle)) throw new Error('Ce nom de groupe existe déjà dans cette classe');
      const sel = Utilities.getUuid();
      ecrire_(null, cle, req.classe, req.nom, req.data, hash_(req.password, sel), sel);
      return { ok: true };
    });
  }

  if (a === 'load' || a === 'save') {
    const cle = cle_(req.classe, req.nom);
    const ligne = trouver_(cle);
    if (!ligne) throw new Error('Groupe introuvable');
    if (hash_(req.password, ligne.sel) !== ligne.empreinte) throw new Error('Mot de passe incorrect');
    if (a === 'load') return { ok: true, data: lireDonnees_(ligne.row) };
    return verrou_(function () {
      ecrire_(ligne.row, cle, req.classe, req.nom, req.data, ligne.empreinte, ligne.sel);
      return { ok: true };
    });
  }

  // ---- actions enseignant ----
  if (String(req.teacher || '') !== MOT_DE_PASSE_PROF) throw new Error('Mot de passe enseignant incorrect');

  if (a === 'teacherList') {
    const f = feuille_();
    const n = f.getLastRow() - 1;
    if (n < 1) return { ok: true, groups: [] };
    const v = f.getRange(2, 1, n, COLONNES.length).getValues();
    return { ok: true, groups: v.filter(r => r[0]).map(r => ({ key: r[0], classe: r[1], nom: r[2], membres: r[3], maj: r[6], seances: r[7] })) };
  }
  const ligne = trouver_(req.key);
  if (!ligne) throw new Error('Groupe introuvable');
  if (a === 'teacherLoad') return { ok: true, data: lireDonnees_(ligne.row) };
  if (a === 'teacherSave') {
    return verrou_(function () {
      ecrire_(ligne.row, ligne.cle, ligne.classe, ligne.nom, req.data, ligne.empreinte, ligne.sel);
      return { ok: true };
    });
  }
  if (a === 'teacherSetPassword') {
    if (!req.password || String(req.password).length < 4) throw new Error('Mot de passe trop court (4 caractères minimum)');
    return verrou_(function () {
      const sel = Utilities.getUuid();
      feuille_().getRange(ligne.row, 5, 1, 2).setValues([[hash_(req.password, sel), sel]]);
      return { ok: true };
    });
  }
  if (a === 'teacherDelete') {
    return verrou_(function () { feuille_().deleteRow(ligne.row); return { ok: true }; });
  }
  throw new Error('Action inconnue');
}

// ---------- outils ----------
function feuille_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let f = ss.getSheetByName(ONGLET);
  if (!f) {
    f = ss.insertSheet(ONGLET);
    f.getRange(1, 1, 1, COLONNES.length + 1).setValues([COLONNES.concat(['donnees (suite à droite)'])]);
    f.setFrozenRows(1);
  }
  return f;
}
function cle_(classe, nom) {
  const norm = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
  if (!norm(nom)) throw new Error('Nom de groupe manquant');
  return norm(classe) + '|' + norm(nom);
}
function hash_(mdp, sel) {
  const octets = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sel + '|' + String(mdp || ''), Utilities.Charset.UTF_8);
  return Utilities.base64Encode(octets);
}
function trouver_(cle) {
  const f = feuille_();
  const n = f.getLastRow() - 1;
  if (n < 1) return null;
  const v = f.getRange(2, 1, n, COLONNES.length).getValues();
  for (let i = 0; i < v.length; i++) {
    if (v[i][0] === cle) return { row: i + 2, cle: v[i][0], classe: v[i][1], nom: v[i][2], empreinte: v[i][4], sel: v[i][5] };
  }
  return null;
}
function lireDonnees_(row) {
  const f = feuille_();
  const debut = COLONNES.length + 1;
  const largeur = Math.max(1, f.getLastColumn() - COLONNES.length);
  const morceaux = f.getRange(row, debut, 1, largeur).getValues()[0];
  const txt = morceaux.filter(x => x !== '').join('');
  return txt ? JSON.parse(txt) : null;
}
function ecrire_(row, cle, classe, nom, data, empreinte, sel) {
  const f = feuille_();
  const txt = JSON.stringify(data || {});
  const morceaux = [];
  for (let i = 0; i < txt.length; i += TAILLE_MORCEAU) morceaux.push(txt.slice(i, i + TAILLE_MORCEAU));
  const membres = (data && data.members || []).join(', ');
  const nb = (data && data.sessions || []).length;
  const tete = [cle, classe, nom, membres, empreinte, sel, new Date(), nb];
  if (!row) row = f.getLastRow() + 1;
  // efface les anciens morceaux puis écrit
  const ancienne = f.getLastColumn() - COLONNES.length;
  if (ancienne > 0) f.getRange(row, COLONNES.length + 1, 1, ancienne).clearContent();
  f.getRange(row, 1, 1, tete.length).setValues([tete]);
  f.getRange(row, COLONNES.length + 1, 1, morceaux.length).setValues([morceaux]);
}
function verrou_(fn) {
  const l = LockService.getScriptLock();
  l.waitLock(20000);
  try { return fn(); } finally { l.releaseLock(); }
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
