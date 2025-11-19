#!/bin/bash

# Script to configure CORS for Firebase Storage
# This allows localhost development

echo "Setting up CORS for Firebase Storage..."

# Add Google Cloud SDK to PATH if installed via Homebrew
if [ -d "/opt/homebrew/share/google-cloud-sdk/bin" ]; then
    export PATH="/opt/homebrew/share/google-cloud-sdk/bin:$PATH"
fi

# Check if gsutil is available
if ! command -v gsutil &> /dev/null; then
    echo "ERROR: gsutil is not installed or not in PATH."
    echo ""
    echo "Please install Google Cloud SDK:"
    echo "  brew install --cask gcloud-cli"
    echo ""
    echo "If installation fails due to Python issues, try:"
    echo "  export CLOUDSDK_PYTHON=$(which python3)"
    echo "  brew install --cask gcloud-cli"
    echo ""
    echo "Then authenticate:"
    echo "  gcloud auth login"
    echo "  gcloud config set project outfittracker-28a32"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "ERROR: Not authenticated with Google Cloud."
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set the project
gcloud config set project outfittracker-28a32

# Apply CORS configuration
echo "Applying CORS configuration..."
gsutil cors set cors.json gs://outfittracker-28a32.firebasestorage.app

echo ""
echo "CORS configuration applied successfully!"
echo "You can now upload images from localhost."

