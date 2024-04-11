# Read sql password
read -s -p "Enter password: " password
mysql $(whoami) -p$password < "$1"