import socket

def scan_mysql():
    target = "127.0.0.1"
    port = 3306
    
    print(f"Scanning {target} for MySQL (3306)...")
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)
    result = sock.connect_ex((target, port))
    if result == 0:
        print("MySQL is UP (Port 3306 OPEN)")
    else:
        print("MySQL is DOWN (Port 3306 CLOSED)")
    sock.close()

if __name__ == "__main__":
    scan_mysql()
