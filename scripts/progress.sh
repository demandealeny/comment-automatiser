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
#
# Le fichier vit dans ${CLAUDE_PLUGIN_DATA} (fourni par Claude Code, survit aux mises à jour),
# avec repli sur ~/.claude/comment-automatiser si la variable n'est pas définie.

set -euo pipefail

DATA_DIR="${CLAUDE_PLUGIN_DATA:-$HOME/.claude/comment-automatiser}"
PROGRESS_FILE="$DATA_DIR/progress.json"

ensure_file() {
  mkdir -p "$DATA_DIR"
  if [ ! -f "$PROGRESS_FILE" ]; then
    echo '{"tutorials":{}}' > "$PROGRESS_FILE"
  fi
}

# jq est requis. Si absent, on le signale clairement plutôt que d'échouer en silence.
require_jq() {
  if ! command -v jq >/dev/null 2>&1; then
    echo "ERREUR: 'jq' est requis mais introuvable. Installez-le (ex: apt install jq / brew install jq)." >&2
    exit 1
  fi
}

write_json() {
  # jq options + filtre passés en arguments ; écriture atomique sur le fichier
  local tmp
  tmp="$(mktemp)"
  jq "$@" "$PROGRESS_FILE" > "$tmp" && mv "$tmp" "$PROGRESS_FILE"
}

cmd="${1:-load}"

case "$cmd" in
  load)
    ensure_file
    cat "$PROGRESS_FILE"
    ;;

  get)
    require_jq; ensure_file
    tuto="${2:?Usage: progress.sh get <tuto>}"
    jq --arg t "$tuto" '.tutorials[$t] // {"status":"not_started","currentStep":0}' "$PROGRESS_FILE"
    ;;

  step)
    require_jq; ensure_file
    tuto="${2:?Usage: progress.sh step <tuto>}"
    jq -r --arg t "$tuto" '.tutorials[$t].currentStep // 0' "$PROGRESS_FILE"
    ;;

  start)
    require_jq; ensure_file
    tuto="${2:?Usage: progress.sh start <tuto> <nbEtapes>}"
    total="${3:?Usage: progress.sh start <tuto> <nbEtapes>}"
    now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    # ne réinitialise pas un tuto déjà en cours : conserve la progression existante
    write_json --arg t "$tuto" --argjson total "$total" --arg now "$now" \
      'if (.tutorials[$t]|not) then
         .tutorials[$t] = {status:"in_progress", currentStep:1, totalSteps:$total, completed:[], startedAt:$now}
       else . end'
    jq --arg t "$tuto" '.tutorials[$t]' "$PROGRESS_FILE"
    ;;

  pass)
    require_jq; ensure_file
    tuto="${2:?Usage: progress.sh pass <tuto> <n>}"
    n="${3:?Usage: progress.sh pass <tuto> <n>}"
    write_json --arg t "$tuto" --argjson n "$n" \
      '.tutorials[$t].completed = ((.tutorials[$t].completed // []) + [$n] | unique)
       | .tutorials[$t].currentStep = ($n + 1)
       | .tutorials[$t].status = "in_progress"'
    jq --arg t "$tuto" '.tutorials[$t]' "$PROGRESS_FILE"
    ;;

  done)
    require_jq; ensure_file
    tuto="${2:?Usage: progress.sh done <tuto>}"
    now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    write_json --arg t "$tuto" --arg now "$now" \
      '.tutorials[$t].status = "completed" | .tutorials[$t].completedAt = $now'
    jq --arg t "$tuto" '.tutorials[$t]' "$PROGRESS_FILE"
    ;;

  reset)
    require_jq; ensure_file
    tuto="${2:?Usage: progress.sh reset <tuto>}"
    write_json --arg t "$tuto" 'del(.tutorials[$t])'
    echo "Tutoriel '$tuto' remis à zéro."
    ;;

  hint)
    # Rappel discret au démarrage de session : n'affiche RIEN s'il n'y a aucun tuto en cours,
    # pour ne pas encombrer les sessions sans rapport avec les tutoriels.
    ensure_file
    command -v jq >/dev/null 2>&1 || exit 0
    jq -r '
      [ .tutorials | to_entries[] | select(.value.status == "in_progress") ] as $wip
      | if ($wip | length) > 0 then
          "[comment-automatiser] Tutoriel(s) en cours : "
          + ( [ $wip[] | "\(.key) (étape \(.value.currentStep)/\(.value.totalSteps // "?"))" ] | join(", ") )
          + ". Reprends avec /comment-automatiser:start <id> ou /comment-automatiser:status."
        else empty end
    ' "$PROGRESS_FILE"
    ;;

  *)
    echo "Commande inconnue: $cmd" >&2
    echo "Commandes: load | get <tuto> | step <tuto> | start <tuto> <n> | pass <tuto> <n> | done <tuto> | reset <tuto>" >&2
    exit 1
    ;;
esac
