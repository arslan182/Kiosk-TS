# CI mit GitHub Actions in diesem Hono-Projekt

Diese Anleitung erklaert dir Schritt fuer Schritt, was CI ist und wie du fuer
dieses Bun/Hono-Projekt einen einfachen CI-Workflow mit GitHub Actions
einrichten kannst.

Du musst dafuer noch kein DevOps-Vorwissen haben.

## Was ist CI?

CI steht fuer **Continuous Integration**. Auf Deutsch bedeutet das ungefaehr:
Code wird regelmaessig automatisch geprueft.

Typischer Ablauf:

1. Du aenderst Code in deinem Projekt.
2. Du speicherst die Aenderungen mit Git in einem Commit.
3. Du pushst den Commit zu GitHub.
4. GitHub startet automatisch Pruefungen.
5. GitHub zeigt dir, ob alles bestanden wurde.

Wenn alles passt, ist der CI-Lauf **gruen**. Wenn etwas fehlschlaegt, ist der
CI-Lauf **rot**. Dann klickst du in GitHub auf den fehlgeschlagenen Lauf und
schaust dir die Fehlermeldung an.

CI ersetzt nicht dein eigenes Verstehen des Codes, aber CI hilft dir dabei,
Fehler frueh zu finden.

## Was ist GitHub Actions?

**GitHub Actions** ist das Automatisierungssystem von GitHub.

Damit kannst du GitHub sagen:

> Immer wenn jemand Code pusht oder einen Pull Request erstellt, fuehre diese
> Befehle aus.

Diese Befehle stehen in einer Workflow-Datei. Eine Workflow-Datei ist eine
YAML-Datei und liegt normalerweise hier:

```text
.github/workflows/ci.yml
```

GitHub erkennt diese Datei automatisch.

## Was soll CI in diesem Projekt pruefen?

Dieses Projekt verwendet laut `package.json` **Bun** als Package Manager und
Runtime. Deshalb installiert der Workflow Bun und fuehrt danach die passenden
Befehle aus.

Wichtig: In diesem Projekt solltest du fuer die Tests nicht einfach
`bun test` verwenden. Laut `ReadMe.md` werden die Tests mit **Vitest**
ausgefuehrt. Deshalb verwenden wir fuer Unit-Tests:

```shell
bun vitest --project unit
```

Fuer den ersten einfachen CI-Workflow pruefen wir nur Dinge, die ohne
zusaetzliche Server laufen:

- Abhaengigkeiten installieren
- Formatierung pruefen
- Linter ausfuehren
- TypeScript pruefen
- Unit-Tests ausfuehren

Die Integrationstests werden hier bewusst noch nicht ausgefuehrt, weil sie laut
`ReadMe.md` laufende Infrastruktur brauchen, zum Beispiel Appserver, Datenbank
und Mailserver.

## Beispiel fuer `.github/workflows/ci.yml`

Erstelle in deinem Projekt diese Datei:

```text
.github/workflows/ci.yml
```

Der Inhalt kann so aussehen:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  quality:
    runs-on: ubuntu-latest

    steps:
      - name: Repository herunterladen
        uses: actions/checkout@v5

      - name: Bun installieren
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.3.14

      - name: Abhaengigkeiten installieren
        run: bun install --frozen-lockfile

      - name: Formatierung pruefen
        run: bun run fmt:check

      - name: Linter ausfuehren
        run: bun run lint

      - name: TypeScript pruefen
        run: bun run tsc

      - name: Unit-Tests ausfuehren
        run: bun vitest --project unit
```

## Was bedeuten die wichtigsten Teile?

```yaml
name: CI
```

Das ist der Name, den du spaeter in GitHub unter **Actions** siehst.

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

Damit startet GitHub den Workflow bei einem `push` auf den Branch `main` und
bei einem Pull Request gegen `main`.

```yaml
permissions:
  contents: read
```

Der Workflow darf den Repository-Inhalt lesen. Mehr Rechte braucht dieser
einfache CI-Workflow nicht.

```yaml
runs-on: ubuntu-latest
```

GitHub startet eine frische Linux-Umgebung fuer den Job. Dort werden die
Befehle ausgefuehrt.

```yaml
uses: actions/checkout@v5
```

Dieser Schritt laedt deinen Repository-Code in die GitHub-Actions-Umgebung.
Ohne diesen Schritt haette der Workflow deinen Code nicht lokal verfuegbar.

```yaml
uses: oven-sh/setup-bun@v2
```

Dieser Schritt installiert Bun in der GitHub-Actions-Umgebung.

```yaml
bun-version: 1.3.14
```

Das passt zur Version aus `package.json`.

## Was machen die Befehle?

```shell
bun install --frozen-lockfile
```

Installiert die Abhaengigkeiten. `--frozen-lockfile` bedeutet: Die Datei
`bun.lock` darf dabei nicht automatisch veraendert werden. Das ist in CI gut,
weil CI reproduzierbar sein soll.

```shell
bun run fmt:check
```

Prueft die Formatierung mit `oxfmt`. Der Befehl aendert nichts, sondern meldet
nur, ob etwas falsch formatiert ist.

```shell
bun run lint
```

Fuehrt `oxlint` aus. Der Linter sucht nach Codeproblemen und Regelverstoessen.

```shell
bun run tsc
```

Fuehrt die TypeScript-Pruefung aus. Dadurch werden Typfehler gefunden.

```shell
bun vitest --project unit
```

Fuehrt nur die Unit-Tests aus. Das ist fuer den ersten CI-Workflow sinnvoll,
weil diese Tests ohne gestartete Datenbank, Mailserver oder Appserver laufen
sollen.

## Schritt fuer Schritt einrichten

1. Erstelle im Projektroot den Ordner `.github`.
2. Erstelle darin den Ordner `workflows`.
3. Erstelle darin die Datei `ci.yml`.
4. Fuege den YAML-Inhalt aus dem Beispiel oben ein.
5. Committe die Aenderung mit Git.
6. Pushe die Aenderung zu GitHub.
7. Oeffne dein Repository auf GitHub.
8. Klicke oben auf **Actions**.
9. Waehle den Workflow **CI** aus.
10. Pruefe, ob der Lauf gruen oder rot ist.

Wenn der Lauf gruen ist, wurden alle Schritte erfolgreich ausgefuehrt.

Wenn der Lauf rot ist, klicke auf den fehlgeschlagenen Job und dann auf den
fehlgeschlagenen Schritt. Dort findest du die genaue Fehlermeldung.

## Typische Fehler und was sie bedeuten

### `bun install --frozen-lockfile` schlaegt fehl

Dann passt meistens `package.json` nicht zu `bun.lock`.

Loesung:

1. Lokal `bun install` ausfuehren.
2. Pruefen, ob sich `bun.lock` geaendert hat.
3. `bun.lock` mit committen.

### `bun run fmt:check` schlaegt fehl

Dann ist Code nicht so formatiert, wie `oxfmt` es erwartet.

Loesung:

```shell
bun run fmt
```

Danach die geaenderten Dateien committen.

### `bun run lint` schlaegt fehl

Dann hat `oxlint` ein Codeproblem gefunden.

Loesung:

1. Fehlermeldung lesen.
2. Die genannte Datei oeffnen.
3. Die genannte Stelle korrigieren.
4. Den Linter lokal erneut ausfuehren.

```shell
bun run lint
```

### `bun run tsc` schlaegt fehl

Dann gibt es mindestens einen TypeScript-Fehler.

Loesung:

1. Fehlermeldung lesen.
2. Datei und Zeile aus der Meldung oeffnen.
3. Typfehler korrigieren.
4. Lokal erneut pruefen.

```shell
bun run tsc
```

### `bun vitest --project unit` schlaegt fehl

Dann ist ein Unit-Test fehlgeschlagen.

Loesung:

1. In der Fehlermeldung schauen, welcher Test rot ist.
2. Pruefen, ob der Test falsch ist oder der Code wirklich kaputt ist.
3. Code oder Test korrigieren.
4. Lokal erneut ausfuehren.

```shell
bun vitest --project unit
```

## Warum noch keine Integrationstests?

Dieses Projekt hat auch Integrationstests. Diese Tests pruefen groessere
Zusammenhaenge, zum Beispiel REST- oder GraphQL-Endpunkte.

Laut `ReadMe.md` brauchen diese Tests aber laufende Infrastruktur:

- DB-Server
- Mailserver
- Appserver

Das kann man spaeter auch in GitHub Actions einrichten, zum Beispiel mit Docker
Compose oder GitHub-Actions-Services. Fuer den Anfang ist es aber einfacher und
stabiler, zuerst nur Formatierung, Linting, TypeScript und Unit-Tests in CI
auszufuehren.

## Nuetzliche Links

- GitHub Actions Workflow Syntax:
  <https://docs.github.com/actions/learn-github-actions/workflow-syntax-for-github-actions>
- Bun CI/CD Guide:
  <https://bun.com/guides/install/cicd>
- Bun install Dokumentation:
  <https://bun.com/docs/cli/install>

