#!/bin/bash
# Script to serve the exported blog for testing

# Check if the blog has been exported
if [ ! -d "blog-static-export" ] || [ -z "$(ls -A blog-static-export)" ]; then
  echo "Blog hasn't been exported yet. Run 'npm run export-blog' first."
  exit 1
fi

# Set default port and allow custom port from command line argument
DEFAULT_PORT=3333
CUSTOM_PORT=$1

if [[ -n "$CUSTOM_PORT" && "$CUSTOM_PORT" =~ ^[0-9]+$ ]]; then
  PORT=$CUSTOM_PORT
  echo "Using custom port: $PORT"
  # For custom ports, only check that one port
  MAX_PORT=$PORT
else
  PORT=$DEFAULT_PORT
  # For default port, try up to 10 ports
  MAX_PORT=$((DEFAULT_PORT + 10))
fi

# Function to check if a port is available
port_is_available() {
  local port=$1
  
  # Try using netcat first
  if command -v nc &> /dev/null; then
    ! (nc -z localhost $port >/dev/null 2>&1)
    return $?
  fi
  
  # Try using lsof as a fallback
  if command -v lsof &> /dev/null; then
    ! (lsof -i:$port -P -n | grep LISTEN >/dev/null 2>&1)
    return $?
  fi
  
  # Try a pure bash solution as final fallback
  (echo > /dev/tcp/localhost/$port) >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    # Connection succeeded, port is in use
    return 1
  else
    # Connection failed, port is available
    return 0
  fi
}

# Find an available port
while [ $PORT -le $MAX_PORT ]; do
  if port_is_available $PORT; then
    break
  fi
  
  # For custom ports, exit immediately if not available
  if [[ -n "$CUSTOM_PORT" ]]; then
    echo "Error: Port $PORT is already in use."
    echo "Please specify a different port: npm run serve-blog -- 8081"
    exit 1
  fi
  
  echo "Port $PORT is in use, trying next port..."
  PORT=$((PORT + 1))
done

if [ $PORT -gt $MAX_PORT ]; then
  echo "Error: Could not find an available port between $DEFAULT_PORT and $MAX_PORT."
  echo "Please close some applications and try again, or specify a custom port:"
  echo "npm run serve-blog -- 8080"
  exit 1
fi

# Serve the blog using a simple HTTP server
echo "Starting HTTP server to serve the exported blog..."
echo "Open http://localhost:$PORT/blog/ in your browser"
echo "Press Ctrl+C to stop the server"

# Determine which HTTP server to use
if command -v python3 &> /dev/null; then
  python3 -m http.server $PORT --directory blog-static-export
elif command -v python &> /dev/null; then
  python -m SimpleHTTPServer $PORT --directory blog-static-export
elif command -v npx &> /dev/null; then
  npx serve blog-static-export -p $PORT
else
  echo "Error: No suitable HTTP server found."
  echo "Please install python3, python, or npx to serve the blog."
  exit 1
fi
