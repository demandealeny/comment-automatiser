#!/usr/bin/env bash
# Gestion de la progression des tutoriels du plugin « comment-automatiser ».
# État stocké en JSON, persistant entre sessions.
#
# Usage :
#   progress.sh load                       # affiche tout l'état (initialise si absent)
#   progress.sh get   <tuto>               # affiche l'état d'un tutoriel (JSON)
#   progress.sh step  <tuto>               # affiche le numéro de l'étape courante (entier)
#   progress.sh start <tuto> <nbEtapes>    # démarre/initialise un tuto (étape courante = 1)
#   progress.sh pass  <tuto> <n>           # marque l'étape n réussie et avance à n+1
#   progress.sh done  <tuto>               # marque le tuto terminé
#   progress.sh reset <tuto>               # remet le tuto à zéro
#   progress.sh hint                       # rappel discret si un tuto est en cours (sinon rien)
#
# Le fichier vit dans ${CLAUDE_PLUGIN_DATA} (fourni par Claude Code / Cowork, survit aux mises à
# jour), avec repli sur ~/.claude/comment-automatiser si la variable n'est pas définie.
#
# Portabilité : aucune dépendance externe à part Python 3 (présent dans les sandbox Claude Code et
# Cowork). On n'utilise PAS jq, qui n'est pas garanti dans tous les environnements.

set -euo pipefail

PY="$(command -v python3 || command -v python || true)"
if [ -z "$PY" ]; then
  echo "ERREUR: Python 3 est requis mais introuvable." >&2
  exit 1
fi

exec "$PY" - "$@" <<'PYEOF'
import json, os, sys, datetime

data_dir = os.environ.get("CLAUDE_PLUGIN_DATA") or os.path.join(
    os.path.expanduser("~"), ".claude", "comment-automatiser")
progress_file = os.path.join(data_dir, "progress.json")


def load():
    os.makedirs(data_dir, exist_ok=True)
    if not os.path.exists(progress_file):
        return {"tutorials": {}}
    try:
        with open(progress_file, encoding="utf-8") as f:
            data = json.load(f)
    except (ValueError, OSError):
        return {"tutorials": {}}
    data.setdefault("tutorials", {})
    return data


def save(data):
    os.makedirs(data_dir, exist_ok=True)
    tmp = progress_file + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, progress_file)


def now():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def dump(obj):
    print(json.dumps(obj, ensure_ascii=False, indent=2))


args = sys.argv[1:]
cmd = args[0] if args else "load"


def need(i, usage):
    if len(args) <= i:
        sys.stderr.write("Usage: " + usage + "\n")
        sys.exit(1)
    return args[i]


data = load()
tut = data["tutorials"]

if cmd == "load":
    save(data)
    dump(data)

elif cmd == "get":
    t = need(1, "progress.sh get <tuto>")
    dump(tut.get(t, {"status": "not_started", "currentStep": 0}))

elif cmd == "step":
    t = need(1, "progress.sh step <tuto>")
    print(tut.get(t, {}).get("currentStep", 0))

elif cmd == "start":
    t = need(1, "progress.sh start <tuto> <nbEtapes>")
    total = int(need(2, "progress.sh start <tuto> <nbEtapes>"))
    # ne réinitialise pas un tuto déjà en cours : conserve la progression existante
    if t not in tut:
        tut[t] = {"status": "in_progress", "currentStep": 1,
                  "totalSteps": total, "completed": [], "startedAt": now()}
        save(data)
    dump(tut[t])

elif cmd == "pass":
    t = need(1, "progress.sh pass <tuto> <n>")
    n = int(need(2, "progress.sh pass <tuto> <n>"))
    entry = tut.setdefault(t, {"status": "in_progress", "currentStep": 1, "completed": []})
    entry["completed"] = sorted(set(entry.get("completed", []) + [n]))
    entry["currentStep"] = n + 1
    entry["status"] = "in_progress"
    save(data)
    dump(entry)

elif cmd == "done":
    t = need(1, "progress.sh done <tuto>")
    entry = tut.setdefault(t, {"completed": []})
    entry["status"] = "completed"
    entry["completedAt"] = now()
    save(data)
    dump(entry)

elif cmd == "reset":
    t = need(1, "progress.sh reset <tuto>")
    tut.pop(t, None)
    save(data)
    print("Tutoriel '%s' remis à zéro." % t)

elif cmd == "hint":
    # Rappel discret : n'affiche RIEN s'il n'y a aucun tuto en cours.
    wip = [(k, v) for k, v in tut.items() if v.get("status") == "in_progress"]
    if wip:
        parts = ["%s (étape %s/%s)" % (k, v.get("currentStep", "?"), v.get("totalSteps", "?"))
                 for k, v in wip]
        print("[comment-automatiser] Tutoriel(s) en cours : " + ", ".join(parts) +
              ". Reprends avec /comment-automatiser:start <id> ou /comment-automatiser:status.")

else:
    sys.stderr.write("Commande inconnue: %s\n" % cmd)
    sys.stderr.write("Commandes: load | get <tuto> | step <tuto> | start <tuto> <n> | "
                     "pass <tuto> <n> | done <tuto> | reset <tuto> | hint\n")
    sys.exit(1)
PYEOF
