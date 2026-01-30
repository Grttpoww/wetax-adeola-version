# Anleitung: Repository auf GitHub hochladen

## Schritt 1: GitHub CLI installieren

Falls GitHub CLI noch nicht installiert ist, installiere es mit einem der folgenden Befehle:

**Mit winget (Windows):**
```powershell
winget install --id GitHub.cli
```

**Oder lade es manuell herunter von:**
https://cli.github.com/

## Schritt 2: Git-Konfiguration setzen

```powershell
git config user.name "Dein Name"
git config user.email "deine.email@example.com"
```

## Schritt 3: Dateien zum Repository hinzufügen

```powershell
git add .
```

## Schritt 4: Ersten Commit erstellen

```powershell
git commit -m "Initial commit: WeTax Adeola Version"
```

## Schritt 5: Bei GitHub anmelden

```powershell
gh auth login
```

Folge den Anweisungen im Terminal, um dich bei GitHub anzumelden.

## Schritt 6: Neues Repository auf GitHub erstellen und hochladen

```powershell
gh repo create wetax_adeolaversion --public --source=. --remote=origin --push
```

**Alternative:** Falls das Repository bereits existiert oder du es privat erstellen möchtest:

```powershell
# Repository erstellen (öffentlich)
gh repo create wetax_adeolaversion --public

# Oder privat
gh repo create wetax_adeolaversion --private

# Remote hinzufügen und pushen
git remote add origin https://github.com/DEIN_USERNAME/wetax_adeolaversion.git
git branch -M main
git push -u origin main
```

## Schritt 7: Überprüfen

Öffne dein Browser und gehe zu:
```
https://github.com/DEIN_USERNAME/wetax_adeolaversion
```

Das Repository sollte jetzt online sein!


