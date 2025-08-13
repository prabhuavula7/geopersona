#!/bin/bash

echo "🐳 Testing Docker build locally..."

# Build the Docker image
echo "Building Docker image..."
docker build -t geopersona-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    
    echo "🚀 Testing container startup..."
    # Run the container in background
    docker run -d --name geopersona-test -p 8000:8000 geopersona-test
    
    # Wait for container to start
    sleep 10
    
    # Test health check
    echo "🏥 Testing health check..."
    curl -f http://localhost:8000/ready
    
    if [ $? -eq 0 ]; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed!"
    fi
    
    # Clean up
    echo "🧹 Cleaning up..."
    docker stop geopersona-test
    docker rm geopersona-test
    
else
    echo "❌ Docker build failed!"
    exit 1
fi
