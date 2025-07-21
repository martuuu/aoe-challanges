#!/bin/bash

echo "🚀 Setting up AoE Historial project..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Verificar si pnpm está instalado, si no usar npm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
else
    PACKAGE_MANAGER="npm"
    echo "💡 pnpm not found, using npm instead"
fi

echo "📦 Installing dependencies with $PACKAGE_MANAGER..."
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    $PACKAGE_MANAGER install --legacy-peer-deps
else
    $PACKAGE_MANAGER install
fi

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your Supabase credentials before running the app"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Run 'npm run db:setup' to setup the database"
echo "3. Run 'npm run dev' to start development server"
echo ""
echo "🎮 Ready to track some AoE matches!"
