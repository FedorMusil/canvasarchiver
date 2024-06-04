## Korte instalatie instructies voor development enveriment

## Wireguard
Voor het gebruik van de server moet je met de wireguard config file verbinding maken.

Installeer Wireguard:
- Sudo apt install wireguard

Verplaats de file die je hebt gekregen naar etc/wireguard en hernaam de file naar wg0.conf

voer het command: sudo wg-quick up wg0 uit om verbinding te maken, Vervang up voor down op verbinding te vebreken.

SSH naar 192.168.0.206 hier bevind zich de server.

