#!/usr/bin/env python3
"""
PontoHub Portal Backend - Main Flask Application
"""

import os
import sys
import subprocess
import time
import threading
import requests
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

# Add the parent directory to the path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)

# Configuration
NODE_BACKEND_PORT = 3001
NODE_BACKEND_URL = f"http://localhost:{NODE_BACKEND_PORT}"

# Global variable to track backend process
backend_process = None

def start_node_backend():
    """Start the Node.js backend server"""
    global backend_process
    try:
        # Get the backend directory (parent of src)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        print(f"🚀 Starting Node.js backend from: {backend_dir}")
        
        # Start the Node.js server
        backend_process = subprocess.Popen(
            ['npm', 'start'],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=dict(os.environ, NODE_ENV='production')
        )
        
        # Wait for the server to start
        print("⏳ Waiting for Node.js backend to start...")
        time.sleep(10)
        
        # Check if server is running
        max_retries = 5
        for i in range(max_retries):
            try:
                response = requests.get(f"{NODE_BACKEND_URL}/api/health", timeout=5)
                if response.status_code == 200:
                    print("✅ Node.js backend started successfully")
                    return True
            except Exception as e:
                print(f"⏳ Attempt {i+1}/{max_retries}: Backend not ready yet...")
                time.sleep(3)
            
        print("❌ Failed to start Node.js backend after retries")
        return False
        
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return False

def proxy_request(path):
    """Proxy requests to the Node.js backend"""
    try:
        # Build the target URL
        target_url = f"{NODE_BACKEND_URL}{path}"
        
        # Prepare headers
        headers = dict(request.headers)
        headers.pop('Host', None)  # Remove host header to avoid conflicts
        
        # Forward the request based on method
        if request.method == 'GET':
            response = requests.get(target_url, params=request.args, headers=headers, timeout=30)
        elif request.method == 'POST':
            response = requests.post(target_url, json=request.get_json(), headers=headers, timeout=30)
        elif request.method == 'PUT':
            response = requests.put(target_url, json=request.get_json(), headers=headers, timeout=30)
        elif request.method == 'DELETE':
            response = requests.delete(target_url, headers=headers, timeout=30)
        else:
            return jsonify({"error": "Method not supported"}), 405
            
        # Return the response with CORS headers
        flask_response = Response(
            response.content,
            status=response.status_code,
            headers=dict(response.headers)
        )
        
        # Add CORS headers
        flask_response.headers['Access-Control-Allow-Origin'] = '*'
        flask_response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        flask_response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        return flask_response
        
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Backend service unavailable", "status": "connection_error"}), 503
    except requests.exceptions.Timeout:
        return jsonify({"error": "Backend service timeout", "status": "timeout"}), 504
    except Exception as e:
        return jsonify({"error": str(e), "status": "proxy_error"}), 500

# Health check endpoint
@app.route('/health')
def health():
    try:
        # Check if Node.js backend is responding
        response = requests.get(f"{NODE_BACKEND_URL}/api/health", timeout=5)
        backend_status = "ok" if response.status_code == 200 else "error"
    except:
        backend_status = "unavailable"
    
    return jsonify({
        "status": "ok",
        "service": "PontoHub Portal Backend Proxy",
        "backend_status": backend_status,
        "version": "1.0.0"
    })

# Handle preflight OPTIONS requests
@app.route('/api/<path:path>', methods=['OPTIONS'])
def api_options(path):
    response = jsonify({"status": "ok"})
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

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
        "version": "1.0.0",
        "description": "Backend proxy for PontoHub Portal - Project Management System"
    })

# Initialize the application
def initialize_app():
    """Initialize the application and start Node.js backend"""
    print("🚀 Initializing PontoHub Portal Backend...")
    
    # Start Node.js backend in a separate thread
    backend_thread = threading.Thread(target=start_node_backend)
    backend_thread.daemon = True
    backend_thread.start()
    
    # Wait for backend to initialize
    time.sleep(12)
    
    print("✅ PontoHub Portal Backend Proxy ready!")

if __name__ == '__main__':
    initialize_app()
    
    # Start Flask proxy
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
else:
    # When running in production (e.g., gunicorn), initialize in a thread
    init_thread = threading.Thread(target=initialize_app)
    init_thread.daemon = True
    init_thread.start()

