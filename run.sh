#!/bin/bash

echo "-------------------------------------------"
echo "🚀 Starting Smart Curriculum AI Stack"
echo "-------------------------------------------"

echo "🛑 Stopping existing containers..."
docker compose down

echo "🧹 Removing old images..."
docker compose build --no-cache

echo "📦 Starting containers..."
docker compose up -d

echo "⏳ Waiting for Ollama API..."

MAX_RETRIES=30
COUNT=0

until curl -s http://localhost:11434/api/tags > /dev/null 2>&1
do
  sleep 2
  COUNT=$((COUNT+1))

  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "❌ Ollama did not start in time."
    echo "Run: docker logs ollama"
    exit 1
  fi
done

echo "✅ Ollama API is ready."

echo "🔍 Checking if phi3 model exists..."

if docker exec ollama ollama list | grep -q "phi3"; then
  echo "✅ phi3 already exists."
else
  echo "📥 Pulling phi3..."
  docker exec -it ollama ollama pull phi3
fi

echo "-------------------------------------------"
echo "✅ Stack is ready!"
echo "Frontend:  http://<EC2-IP>:8501"
echo "Backend:   http://<EC2-IP>:8000/docs"
echo "-------------------------------------------"
