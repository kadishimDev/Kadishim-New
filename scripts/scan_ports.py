import socket

def scan_ports():
    target = "127.0.0.1"
    ports = [80, 8080, 8000, 8888, 3000, 5000]
    
    print(f"Scanning {target} for XAMPP...")
    
    found = False
    for port in ports:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((target, port))
        if result == 0:
            print(f"Port {port} is OPEN")
            found = True
        sock.close()
        
    if not found:
        print("No standard web ports are open.")

if __name__ == "__main__":
    scan_ports()
