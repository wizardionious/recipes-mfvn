## [0.3.0] - 2026-03-30

### 🚀 Features

- *(recipes)* Added difficulty for filtering & isPublic for recipe protection (#7)

### 📚 Documentation

- Updated changelog for v0.2.0
- Updated changelog and backend package version for v0.3.0


## [0.2.0] - 2026-03-28

### 🚀 Features

- *(comments)* Add comments for recipes with improved error handling (#3)


## [0.1.0] - 2026-03-27

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

### 📚 Documentation

- Update changelog for v0.1.0 release

### 🧪 Testing

- *(categories)* Added unit tests for category service

### ⚙️ Miscellaneous Tasks

- Configure vitest


