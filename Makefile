.PHONY: changelog changelog-backend changelog-frontend

# Generate changelog for all packages
changelog: changelog-backend

# Generate changelog for backend
changelog-backend:
	git-cliff --unreleased --include-path apps/backend/ -o apps/backend/CHANGELOG.md

# Generate changelog for frontend (when ready)
changelog-frontend:
	git-cliff --unreleased --include-path apps/frontend/ -o apps/frontend/CHANGELOG.md
