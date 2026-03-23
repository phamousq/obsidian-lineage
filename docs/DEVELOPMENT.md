# Development Workflow Guide

This document outlines the recommended workflow for making changes to the Lineage codebase.

## Overview

The development workflow uses a series of skills to ensure thoughtful design, isolated development, and quality implementation:

1. **Brainstorming** → Design validation
2. **Writing Plans** → Detailed implementation plan
3. **Git Worktrees** → Isolated workspace
4. **Subagent-Driven Development** → Task-by-task implementation with reviews

---

## Step 1: Create a Feature Branch

Always develop in a git worktree to keep your main workspace clean.

```bash
# Create a new worktree with a feature branch
git worktree add .worktrees/<feature-name> -b feat/<feature-name>
cd .worktrees/<feature-name>
npm install
```

---

## Step 2: Brainstorming (Design Phase)

Before writing any code, use the brainstorming skill to validate your idea:

```
/brainstorming
```

The brainstorming skill will:
- Explore project context
- Ask clarifying questions
- Propose 2-3 approaches with trade-offs
- Present a design for approval

**Output:** A design document saved to `docs/plans/YYYY-MM-DD-<feature>-design.md`

---

## Step 3: Writing the Implementation Plan

After design is approved, use the writing-plans skill:

```
/writing-plans
```

The writing-plans skill creates a detailed, bite-sized implementation plan with:
- Exact file paths
- Step-by-step tasks (2-5 minutes each)
- Test commands
- Commit messages

**Output:** A plan document saved to `docs/plans/YYYY-MM-DD-<feature>-implementation.md`

---

## Step 4: Implementing with Subagent-Driven Development

Execute the plan using subagent-driven development:

```
/subagent-driven-development
```

This workflow:
1. Creates a todo list from the plan
2. Dispatches fresh subagent per task
3. Two-stage review after each task:
   - **Spec compliance review** - Does it match the plan?
   - **Code quality review** - Is it well-written?
4. Frequent commits

**Benefits:**
- Fresh context per task (no confusion)
- Automatic review checkpoints
- Catches issues early

---

## Step 5: Build and Test

After implementation, always verify:

```bash
npm run build    # Production build with type checking
npm run test     # Unit tests (vitest)
npm run test:e2e # End-to-end tests (playwright)
```

---

## Step 6: Commit and Push

```bash
git add -A
git commit -m "feat: add feature description"
git push -u origin feat/<feature-name>
```

---

## Step 7: Create Pull Request

Visit: `https://github.com/phamousq/obsidian-lineage/pull/new/feat/<feature-name>`

---

## Quick Reference

| Task | Command |
|------|---------|
| Create worktree | `git worktree add .worktrees/<name> -b feat/<name>` |
| Brainstorming | `/brainstorming` |
| Writing plans | `/writing-plans` |
| Subagent-driven | `/subagent-driven-development` |
| Build | `npm run build` |
| Unit tests | `npm run test` |
| E2E tests | `npm run test:e2e` |

---

## Skills Reference

- **brainstorming** - Use when creating features, before implementation
- **writing-plans** - Creates detailed implementation plans
- **using-git-worktrees** - Sets up isolated development workspaces
- **subagent-driven-development** - Executes plans with automatic reviews
- **superpowers:verification-before-completion** - Run before claiming work is done
- **superpowers:finishing-a-development-branch** - Use when ready to merge
