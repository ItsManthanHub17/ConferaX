# Git Workflow Guide

## Branch Structure

- **main** - Production-ready code, always stable
- **develop** - Active development branch
- **feature/** - Individual feature branches

## Daily Workflow

### Starting a New Feature

```bash
# Make sure you're on develop and up to date
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name

# Examples:
# git checkout -b feature/booking-notifications
# git checkout -b feature/user-dashboard
# git checkout -b feature/room-availability
```

### Working on Your Feature

```bash
# Make your changes...

# Check what you changed
git status

# Add files
git add .

# Commit with a good message
git commit -m "feat: add description of what you did"

# Push to GitHub
git push -u origin feature/your-feature-name
```

### Finishing a Feature

```bash
# 1. Switch to develop
git checkout develop
git pull origin develop

# 2. Merge your feature
git merge feature/your-feature-name

# 3. Push to GitHub
git push origin develop

# 4. Delete the feature branch (optional)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

### Updating Main (Production)

```bash
# Only when develop is stable and tested

# Switch to main
git checkout main
git pull origin main

# Merge develop into main
git merge develop

# Push to production
git push origin main

# Go back to develop for more work
git checkout develop
```

## Commit Message Format

Use these prefixes for clear commit history:

- **feat:** New feature (e.g., "feat: add email notifications")
- **fix:** Bug fix (e.g., "fix: resolve booking date validation")
- **refactor:** Code restructuring (e.g., "refactor: simplify auth logic")
- **test:** Adding tests (e.g., "test: add room service unit tests")
- **docs:** Documentation (e.g., "docs: update API documentation")
- **style:** Code formatting (e.g., "style: format with prettier")
- **chore:** Maintenance (e.g., "chore: update dependencies")

## Quick Reference

```bash
# See all branches
git branch -a

# See current branch
git branch

# Switch branches
git checkout branch-name

# Check status
git status

# View commit history
git log --oneline --graph --all

# Undo last commit (keeps changes)
git reset --soft HEAD~1

# Discard local changes
git restore filename
```

## Example Feature Development

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/booking-reminders

# Work and commit
git add .
git commit -m "feat: implement booking reminder emails"
git push -u origin feature/booking-reminders

# Finish feature
git checkout develop
git pull origin develop
git merge feature/booking-reminders
git push origin develop
git branch -d feature/booking-reminders
```

## Tips

✅ **Always work on feature branches**, never directly on main or develop  
✅ **Pull before you push** to avoid conflicts  
✅ **Commit often** with clear messages  
✅ **Test before merging** to develop  
✅ **Keep main stable** - only merge tested code  

---

**Current Setup:**
- ✅ main branch - production code
- ✅ develop branch - active development
- 🚀 Ready to create feature branches!
