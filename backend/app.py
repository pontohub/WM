#!/usr/bin/env python3
"""
Flask wrapper for PontoHub Portal Backend
This serves as a proxy to the Node.js backend for deployment compatibility
"""

from flask import Flask, request, jsonify, Response
import requests
import subprocess
import os
import time
import threading

app = Flask(__name__)

# Configuration
NODE_BACKEND_PORT = 3001
NODE_BACKEND_URL = f"http://localhost:{NODE_BACKEND_PORT}"

# Global variable to track backend process
backend_process = None

def start_node_backend():
    """Start the Node.js backend server"""
    global backend_process
    try:
        # Change to backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Start the Node.js server
        backend_process = subprocess.Popen(
            ['npm', 'start'],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a bit for the server to start
        time.sleep(5)
        
        # Check if server is running
        try:
            response = requests.get(f"{NODE_BACKEND_URL}/api/health", timeout=5)
            if response.status_code == 200:
                print("✅ Node.js backend started successfully")
                return True
        except:
            pass
            
        print("❌ Failed to start Node.js backend")
        return False
        
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False

def proxy_request(path):
    """Proxy requests to the Node.js backend"""
    try:
        # Build the target URL
        target_url = f"{NODE_BACKEND_URL}{path}"
        
        # Forward the request
        if request.method == 'GET':
            response = requests.get(target_url, params=request.args, headers=dict(request.headers))
        elif request.method == 'POST':
            response = requests.post(target_url, json=request.get_json(), headers=dict(request.headers))
        elif request.method == 'PUT':
            response = requests.put(target_url, json=request.get_json(), headers=dict(request.headers))
        elif request.method == 'DELETE':
            response = requests.delete(target_url, headers=dict(request.headers))
        else:
            return jsonify({"error": "Method not supported"}), 405
            
        # Return the response
        return Response(
            response.content,
            status=response.status_code,
            headers=dict(response.headers)
        )
        
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Backend service unavailable"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/health')
def health():
    return jsonify({"status": "ok", "service": "PontoHub Portal Backend Proxy"})

# Proxy all API routes
@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_proxy(path):
    return proxy_request(f"/api/{path}")

# Root API route
@app.route('/api', methods=['GET'])
def api_root():
    return proxy_request("/api")

# Default route
@app.route('/')
def index():
    return jsonify({
        "service": "PontoHub Portal Backend",
        "status": "running",
        "version": "1.0.0"
    })

if __name__ == '__main__':
    print("🚀 Starting PontoHub Portal Backend Proxy...")
    
    # Start Node.js backend in a separate thread
    backend_thread = threading.Thread(target=start_node_backend)
    backend_thread.daemon = True
    backend_thread.start()
    
    # Wait for backend to start
    time.sleep(8)
    
    # Start Flask proxy
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

