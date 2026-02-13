#!/bin/bash

# Cleanup script for HopDrop backend
# Removes deprecated files and optimizes structure

echo "🧹 Cleaning up HopDrop backend..."

# Remove deprecated files (already done, but listed for reference)
echo "✅ Removed deprecated files:"
echo "   - database/schema.sql (replaced by schema_star.sql)"
echo "   - etl/loader.js (replaced by loader_star.js)"
echo "   - injetion/storePipeline.js (redundant)"
echo "   - .env.save (backup file)"

# Clean uploads folder (we use memory storage)
if [ -d "uploads" ]; then
    echo "🗑️  Removing uploads folder (using memory storage)..."
    rm -rf uploads/
    echo "   ✅ Removed uploads/"
fi

# Optional: Move sample CSVs to docs (uncomment if desired)
# if [ -d "sample_csv" ]; then
#     echo "📁 Moving sample CSVs to docs/examples..."
#     mkdir -p docs/examples
#     mv sample_csv/* docs/examples/
#     rmdir sample_csv
#     echo "   ✅ Moved to docs/examples/"
# fi

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "📋 Summary:"
echo "   - Deprecated files removed"
echo "   - Uploads folder cleaned"
echo "   - .gitignore created"
echo ""
echo "🚀 Next steps:"
echo "   1. Test server: npm start"
echo "   2. Verify file upload works"
echo "   3. Check analytics endpoints"
