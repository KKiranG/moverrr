#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
source_root="${repo_root}/.agent-skills"
target_root="${HOME}/.hermes/skills"

if [[ ! -d "${source_root}" ]]; then
  echo "Refusing to sync: ${source_root} does not exist." >&2
  exit 1
fi

mkdir -p "${target_root}"
target_root_real="$(cd "${target_root}" && pwd -P)"

shopt -s nullglob
skills=("${source_root}"/movemate-*)
shopt -u nullglob

if [[ ${#skills[@]} -eq 0 ]]; then
  echo "No .agent-skills/movemate-* skills found."
  exit 0
fi

for skill_dir in "${skills[@]}"; do
  [[ -d "${skill_dir}" ]] || continue
  [[ -f "${skill_dir}/SKILL.md" ]] || continue

  skill_name="$(basename "${skill_dir}")"
  if [[ "${skill_name}" != movemate-* ]]; then
    echo "Skipping non-MoveMate skill: ${skill_name}"
    continue
  fi

  target_dir="${target_root_real}/${skill_name}"
  case "${target_dir}" in
    "${target_root_real}"/movemate-*) ;;
    *)
      echo "Refusing unsafe target path: ${target_dir}" >&2
      exit 1
      ;;
  esac

  rm -rf "${target_dir}"
  mkdir -p "${target_dir}"
  cp -R "${skill_dir}/." "${target_dir}/"
  echo "synced ${skill_name} -> ${target_dir}"
done
