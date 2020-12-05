'cp' 'zoidberg.service' '/etc/systemd/system/zoidberg.service'
'systemctl' 'enable' 'zoidberg'
'systemctl' 'start' 'zoidberg'
'ufw' 'allow' '8000'