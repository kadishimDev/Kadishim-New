import http.server
import socketserver
import webbrowser
import os
import sys

# Configuration
PORT = 8000
DIRECTORY = "dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run_server():
    # Change into the script's directory to ensure relative paths work
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    if not os.path.exists(DIRECTORY):
        print(f"Error: Directory '{DIRECTORY}' not found. Please run 'npm run build' first.")
        input("Press Enter to exit...")
        return

    # Allow reusing the address to avoid "Address already in use" errors
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}"
            print(f"Serving at {url}")
            print("Press Ctrl+C to stop the server.")
            
            # Open the browser automatically
            webbrowser.open(url)
            
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 10048:
            print(f"Port {PORT} is busy. Trying {PORT+1}...")
            # Try next port (simple fallback)
            with socketserver.TCPServer(("", PORT+1), Handler) as httpd:
                 url = f"http://localhost:{PORT+1}"
                 print(f"Serving at {url}")
                 webbrowser.open(url)
                 httpd.serve_forever()
        else:
            print(f"Error starting server: {e}")

if __name__ == "__main__":
    run_server()
