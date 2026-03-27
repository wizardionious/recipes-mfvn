## [unreleased]

### 🐛 Bug Fixes

- *(backend)* Remove MongoDB-specific fields from response
- *(backend)* Added category and author validation before recipe creation

### 🚜 Refactor

- *(monorepo)* Migrate to pnpm workspaces
- Created base tsconfig
- *(backend)* HasNext & hasPrev pagination helpers
- Moved form schemas from backend to shared package
- *(backend)* Updated biome configuration
- *(backend)* Created shared types
- *(backend)* Moved auth/me logic to service
- *(backend)* Moved AuthResponse to packages/shared
- *(backend)* Branded Minutes type for recipe cookingTime

### ⚙️ Miscellaneous Tasks

- Configure vitest
