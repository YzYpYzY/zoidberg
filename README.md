# Zoidberg

Keep CI Simple !

# Installation
1. Clone source on server (ex: /apps/zoidberg)
2. Put zoidberg.service in place.
```bash
sudo cp zoidberg.service /etc/systemd/system/zoidberg.service
````
3. Activate the service
```bash
sudo systemctl enable zoidberg
````
4. Start the service
```bash
sudo systemctl start zoidberg
````
5. Open host port
```bash
sudo ufw allow 8000
````

## Tips 
Change default host and port.
- Open the service config
```bash
sudo nano /etc/systemd/system/zoidberg.service
````
- Edit the line :
```
Environment=HOST="0.0.0.0" PORT=8000 
```
- Save.
- Restart service.
```bash
sudo systemctl restart zoidberg
````