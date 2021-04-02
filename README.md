KAdmin-ArkLIN2 
=============
Webbasiertes Admin Panel für Ark-Gameserver basierend auf [Arkmanager](https://github.com/arkmanager/ark-server-tools)

Features:
- Serververwaltung (ServerCenter)
  - Backupverwaltung
  - Konfiguration
  - Modifikationen
  - Automatische Updates
  - Automatische Backups (funktionieren anders als von Arkmanager)
- Serververwaltung
- Benutzer mit Benutzergruppen
- Clustersystem
  - mit Syncronisierung der Einstellungen, wenn gewünscht und mehr!

**Geplante Features**

- Ziehe [Trello](https://trello.com/b/8cKrUtSV)

Wichtig
=============
- **[Dev-Tree]** benutzten auf eigene **GEFAHR**: Debugs, Tests usw.
- **[Test-Tree]** benutzten auf eigene **GEFAHR**: hier werden "Stabile" aber ungetestete Builds für das nächste Update veröffentlicht
- Derzeitiger Status: **BETA**
- `Links`
  - [Spenden?](https://www.paypal.com/cgi-bin/webscr?shell=_s-xclick&hosted_button_id=68PT9KPRABVCU&source=url)
  - [Discord](https://discord.gg/ykGnw49)
  - [Trello](https://trello.com/b/8cKrUtSV)

Installation
=============

1. 1. Installiere alle nötigen Module `sudo apt-get install screen unzip zip curl`
   2. Installiere NodeJS (min 15.6.0)
   3. gebe den Steam user rechte auf Arkmanager Verzeichnis
2. Log dich in den Steam Benutzer ein `su steam`
3. Downloade den letzten Release `cd ~ && mkdir ~/kadmin_arklin && cd ~/kadmin_arklin && wget https://api.arklin2.kadmin-panels.de/sh/installer.sh && chmod 755 ./installer.sh && ./installer.sh master`
   1. Hierbei kann `master` zu `dev` oder `test` geändert werden je nachdem welche branch man benutzen will
4. Erstelle die eine Datenbank (MariaDB) und lade die Tabellen aus `./forInstaller` in diese (ToDo: automatisiertes erstellen von Tabellen)
5. Konfiguriere:
   - `app/config/app.json`
   - `app/config/mysql.json`
6. Starte das Programm mit `chmod 755 ./starter.sh && ./starter.sh`

Update
=============
- Funktioniert automatisch
  - oder im Panel suchen und starten
- Manuell: `cd ~ && wget https://api.arklin2.kadmin-panels.de/sh/updater.sh && chmod 755 ./updater.sh && ./updater.sh master`
  - Hierbei kann `master` zu `dev` oder `test` geändert werden je nachdem welche branch man benutzen will

Autostart einrichten
=============
1. Logge dich in den benutzer `steam` ein `su steam`
2. Öffne den Crontab `crontab -e`
3. füge folgende Zeile hinzu: `@reboot sh chmod 755 ~/kadmin_arklin/starter.sh && ~/kadmin_arklin/starter.sh` **(Hierbei kann der Pfad `~/starter.sh` abweichen!)**

Standart Login
=============
- Benutzername UND Password: `admin`

app.json
=============
| Eigenschaften         | Wert | 
| :---                  | :--- |
| `port`                | Port der genutzt werden soll für den Webserver |
| `servRoot`            | Pfad wo die Server liegen sollen |
| `logRoot`             | Pfad wo die Logs liegen sollen |
| `pathBackup`          | Pfad wo die Backups liegen sollen |
| `pathSteam`           | Pfad wo die SteamCMD liegt |
| `pathArkmanager`      | Pfad wo die Arkmanager liegt (normalerweise `/etc/arkmanager`) |
| `useDebug`            | Debug modus für die Konsole (**true** = an / **false** = aus) |

updater.json
=============
| Eigenschaften         | Wert | 
| :---                  | :--- |
| `useBranch`           | Welche Branch soll benutzt werden **(Erlaubt: dev, master, test)** |
| `automaticInstall`    | Sollen Updates automatisch Installiert werden oder nur gemeldet (**true** = Installer, **false** = nur melden) |

main.json
=============
**INFO:** Hier sollte nur etwas verändert werden wenn man weis was man tut!

| Eigenschaften                         | Wert | 
| :---                                  | :--- |
| `interval > getStateFromServers`      | Interval wo der Status der Server abgefragt wird |
| `interval > getTraffic`               | Interval wo der Server Traffic angefragt wird |
| `interval > doReReadConfig`           | Interval wo die Konfigurationen neu geladen werden |
| `interval > doServerBackgrounder`     | Interval wo Server Hintergrund aktionen ausgeführt werden (sowas wie Backups) |
| `interval > backgroundUpdater`        | Interval wo das Panel auf neue Updates prüft |
| `interval > doJob`                    | WIP (für Cronjobs) |
| `interval > getDataFromSteamAPI`      | Interval wo die Infomationen von der SteamAPI geholt werden sollen |
| `interval > doClusterStuff`           | Interval wo die Einstellungen von den Servern überpüft werden sollen (sowie Sync) |

# Sprache Installieren

- Lade die JSON Dateien in `/lang/<lang>/` hoch 
- WICHTIG: Es wird derzeit nur Deutsch mitgeliefert 
- **derzeit gibt es noch keine Funktion zum wählen der Sprache! (daher überschreibt de_de)**

# Benötigt
- `Betriebssystem`
  - Linux | Getestet auf:
    - Ubuntu Server 20
  - Administrator Rechte bzw genügend Rechte, um Daten in den jeweiligen Ordner zu lesen, & zu Schreiben sowie Auslastung lesen zu dürfen
- `Node.JS` 
  - [Version >= 15.0.0](https://nodejs.org/en/download/package-manager/)
  - [NVM (empfohlen für Versionswechsel)](https://github.com/nvm-sh/nvm)
- `MariaDB` 
  - Server   
  
# Andere Projekte:
| Projekt                                                                     | Status            |       
| :---                                                                        | :---              |         
| [KAdmin-ArkLIN](https://github.com/Kyri123/KAdmin-ArkLIN)                   | Release           |    
| [KAdmin-Minecraft](https://github.com/Kyri123/KAdmin-Minecraft)             | Beta              |   
| [KAdmin-ArkWIN](https://github.com/Kyri123/KAdmin-ArkWIN)                   | Alpha (gestoppt)  |       
| [Kleines Minecraft Plugin](https://github.com/Kyri123/KPlugins-1.12.2)      | Beta              |  

# Danke
- Danke an [**JetBrains**](https://www.jetbrains.com) für die bereitstellung der IDE's für die Entwicklung dieser Open-Source-Software
- Sowie allen Testern und jeden gemeldeten BUG!

# Links

- [Frontend by **AdminLTE 3.1**](https://github.com/ColorlibHQ/AdminLTE)
- [Arkmanager](https://github.com/arkmanager/ark-server-tools)