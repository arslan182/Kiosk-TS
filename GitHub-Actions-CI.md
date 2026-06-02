# CI mit GitHub Actions im Kiosk-Projekt

Diese Anleitung erklaert kurz, wie die GitHub-Actions-CI in diesem Projekt funktioniert und wie man sie startet.

## Was macht die CI?

CI steht fuer Continuous Integration. In diesem Projekt bedeutet das: GitHub prueft automatisch, ob der aktuelle Code noch sauber ist.

Der Workflow liegt hier:

```text
.github/workflows/ci.yml
```

Er fuehrt diese Schritte aus:

```shell
bun install --frozen-lockfile
bun run prettier:check
bun run eslint
bun run tsc
bun vitest --project unit
```

Damit wird geprueft:

- ob sich die Abhaengigkeiten sauber installieren lassen
- ob die Formatierung passt
- ob ESLint Fehler findet
- ob TypeScript kompiliert
- ob die Unit-Tests laufen

Integrationstests und Docker Compose sind bewusst noch nicht Teil dieser einfachen CI, weil sie laufende Infrastruktur wie Appserver, DB und Mailserver brauchen.

Die lokale Datei `src/config/resources/app.toml` wird weiterhin nicht ins Repository gepusht. GitHub Actions erzeugt im Schritt `CI-Konfiguration erstellen` nur fuer den CI-Runner eine minimale temporaere `app.toml`, damit die Unit-Tests auf GitHub denselben Grundaufbau wie lokal finden.

## Wie startet GitHub Actions CI?

Die CI startet automatisch, sobald die Datei `.github/workflows/ci.yml` auf GitHub liegt.

In diesem Projekt startet sie bei:

- `git push origin Fixing`
- `git push origin main`
- Pull Requests gegen `main`

Man kann sie auch manuell starten:

1. Repository auf GitHub oeffnen.
2. Oben auf **Actions** klicken.
3. Links den Workflow **CI** auswaehlen.
4. Rechts auf **Run workflow** klicken.
5. Branch auswaehlen, zum Beispiel `Fixing`.
6. Start bestaetigen.

Wichtig: Beim allerersten Mal erscheint der Workflow in GitHub erst, nachdem `.github/workflows/ci.yml` gepusht wurde.

## Was bedeutet gruen oder rot?

Gruen bedeutet: Alle CI-Schritte waren erfolgreich.

Rot bedeutet: Mindestens ein Schritt ist fehlgeschlagen. Dann in GitHub auf den roten Lauf klicken und den fehlgeschlagenen Schritt oeffnen. Dort steht die konkrete Fehlermeldung.

Typische Ursachen:

- `bun install --frozen-lockfile`: `package.json` und `bun.lock` passen nicht zusammen.
- `bun run prettier:check`: Code ist nicht richtig formatiert.
- `bun run eslint`: ESLint findet Codeprobleme.
- `bun run tsc`: TypeScript findet Typfehler.
- `bun vitest --project unit`: Ein Unit-Test schlaegt fehl.

## Sicherer Branch-Ablauf

Fuer dieses Projekt ist der sichere Ablauf:

1. Auf `Fixing` arbeiten.
2. Lokal pruefen:

```shell
bun run prettier:check
bun run eslint
bun run tsc
bun vitest --project unit
```

3. `Fixing` pushen:

```shell
git push origin Fixing
```

4. GitHub Actions auf `Fixing` abwarten.
5. Nur wenn CI gruen ist, nach `main` mergen.
6. Danach `main` pushen und wieder CI abwarten.
7. Erst danach den alten `Fixing`-Branch loeschen.

Kein Force-Push verwenden.

## Aktueller Workflow

Der aktuelle Workflow verwendet Bun `1.3.13`, passend zu `package.json`:

```yaml
name: CI

on:
  push:
    branches: [Fixing, main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - name: Repository herunterladen
        uses: actions/checkout@v6

      - name: Bun installieren
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.13

      - name: CI-Konfiguration erstellen
        run: |
          mkdir -p src/config/resources
          cat > src/config/resources/app.toml <<'EOF'
          [server]
          port = 3000
          portHttp = 3030

          [db]
          populate = true

          [mail]
          host = "localhost"
          port = 1025
          log = false

          [keycloak]
          host = "localhost"
          port = 8843

          [log]
          dir = "./log"
          level = "debug"
          pretty = true
          EOF

      - name: Abhaengigkeiten installieren
        run: bun install --frozen-lockfile

      - name: Formatierung pruefen
        run: bun run prettier:check

      - name: ESLint ausfuehren
        run: bun run eslint

      - name: TypeScript pruefen
        run: bun run tsc

      - name: Unit-Tests ausfuehren
        run: bun vitest --project unit
```

## Nuetzliche Links

- GitHub Actions: <https://docs.github.com/actions>
- Workflow-Syntax: <https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions>
- Bun in GitHub Actions: <https://bun.com/guides/runtime/cicd>
- setup-bun Action: <https://github.com/oven-sh/setup-bun>
