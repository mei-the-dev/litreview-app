# AI Pair Programming Guide - LitReview App

## Overview
This repository is developed through **AI-Human Pair Programming** using the MARKO framework. The human (Mei) serves as product owner and reviewer, while the AI (Claude) serves as an autonomous coding agent.

## Collaboration Model

### AI Role (Claude)
- **Autonomous Development**: Implements features, fixes bugs, writes tests
- **Self-Validation**: Runs tests, analyzes logs, monitors performance
- **Documentation**: Updates MARKOs, creates status reports
- **Git Operations**: Commits, pushes, creates branches autonomously
- **Continuous Improvement**: Iterates based on test results and monitoring

### Human Role (Mei)
- **Product Owner**: Defines requirements and priorities
- **Reviewer**: Reviews AI's work and provides feedback
- **Decision Maker**: Approves merges, architecture changes
- **Domain Expert**: Provides clarification when AI is uncertain

## Git Workflow

### Commit Conventions
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

Co-authored-by: Claude AI <claude@anthropic.com>
Co-authored-by: Mei <mei@litreview-app.dev>
```

**Types**: feat, fix, refactor, test, docs, perf, chore, ci, style

**Scopes**: pipeline, frontend, backend, api, ui, tests, marko, git, deps

**Examples**:
- `feat(pipeline): add GPU monitoring to stage 6`
- `fix(frontend): resolve navigation to results page`
- `test(e2e): improve frontend rendering tests`

### Branching Strategy
- `main` - Stable production-ready code
- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `refactor/<name>` - Code refactoring
- `test/<name>` - Test improvements

### AI Autonomy Guidelines

#### Autonomous Operations (No Approval Needed)
- Code implementation within task scope
- Writing and running tests
- Bug fixes with tests
- Performance optimizations
- Documentation updates
- Dependency updates (patch/minor)
- Git commits and pushes to feature branches
- Creating/updating MARKO files
- Log analysis and debugging

#### Requires Human Approval
- Merging to `main` branch
- Architecture changes
- Breaking API changes
- Major dependency updates
- Security-critical changes
- Production deployments

## MARKO Framework

### What is MARKO?
**MARKO** (Machine Readable Knowledge Objects) is a JSON-based framework for AI-driven development. Each MARKO file defines:
- Project structure and conventions
- Technology stack and dependencies
- Data flow and architecture
- Task breakdown and progress tracking
- Decision log (ADRs)
- Success criteria

### MARKO Files in This Project
- `marko.json` - Main project MARKO (Single Source of Truth)
- `ai-pair-programming-marko.json` - This workflow guide
- `testing-marko*.json` - Testing strategies
- `*-marko.json` - Feature-specific MARKOs

### How AI Uses MARKOs
1. **Reference**: Reads MARKO to understand project structure and conventions
2. **Follow**: Implements according to architectural decisions
3. **Update**: Updates task status and progress
4. **Create**: Creates new MARKOs for complex features
5. **Document**: Logs decisions in decision_log section

## Development Workflow

### Typical AI Autonomous Cycle
1. **Understand Task** - Read requirements and relevant MARKOs
2. **Plan** - Create MARKO for complex tasks
3. **Implement** - Write code following conventions
4. **Test** - Write and run tests
5. **Validate** - Check logs, monitoring dashboard
6. **Commit** - Commit with proper message
7. **Push** - Push to feature branch
8. **Report** - Inform human of progress

### When AI Escalates to Human
- After 3 failed fix attempts
- Unclear requirements
- Multiple implementation approaches
- Architectural decisions needed
- Before merging to main

## Testing Strategy

### Test Levels
1. **Unit Tests**: Isolated component testing (pytest)
2. **Integration Tests**: API and pipeline testing (pytest)
3. **E2E Tests**: Full user flow testing (Python scripts, no mocks)

### AI Testing Autonomy
- Writes tests for all new code
- Runs tests before committing
- Analyzes test failures and fixes autonomously
- Creates test-specific MARKOs for complex test scenarios
- Iterates until all tests pass

## Monitoring & Debugging

### Tools
- **Dashboard**: `dashboard.py` - Real-time monitoring (run in separate terminal)
- **Logs**: `logs/backend.log`, `logs/frontend.log`
- **Test Output**: Various `*_output.log` files

### AI Debugging Process
1. Reproduce issue
2. Analyze logs and error messages
3. Identify root cause
4. Implement fix with tests
5. Validate fix
6. Commit and push
7. Report if issue persists after 3 attempts

## Project Structure

```
litreview-app/
├── backend/              # FastAPI backend
│   ├── api/             # API layer (routers, models)
│   ├── domain/          # Business logic (pipeline stages)
│   ├── infrastructure/  # External services (AI, APIs)
│   └── core/            # Core utilities (config, websocket)
├── frontend/            # React TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── stores/      # Zustand stores
│   │   ├── services/    # API clients
│   │   ├── hooks/       # Custom hooks
│   │   └── types/       # TypeScript types
├── logs/                # Application logs
├── output/              # Generated reports and PDFs
├── *.marko.json        # MARKO files
└── *.sh                # Shell scripts
```

## Quick Start for Human Collaborator

### Running the Application
```bash
./run.sh              # Start backend and frontend
./dashboard.py        # Monitor in separate terminal
```

### Running Tests
```bash
./run_tests.sh              # Run all tests
./run_e2e_tests.sh          # Run E2E tests only
./run_comprehensive_tests.sh # Full test suite
```

### Checking Status
```bash
git status
git log --oneline -10
cat CURRENT_STATUS.md       # If exists
```

### Reviewing AI's Work
```bash
git diff                    # See uncommitted changes
git show HEAD               # See last commit
git log --graph --oneline   # See commit history
```

### Providing Feedback
Simply tell the AI what you need:
- "Fix the navigation issue"
- "Add GPU monitoring to the dashboard"
- "Improve the test coverage for stage 6"
- "Review the logs and fix the errors"

The AI will:
1. Create a MARKO if needed
2. Implement the changes
3. Test thoroughly
4. Commit and push
5. Report back

## Communication Style

### AI → Human
- Concise and direct
- Reports progress after major milestones
- Asks clear yes/no questions when approval needed
- Escalates blockers immediately

### Human → AI
- Natural language instructions
- Provide context when available
- Approve/reject with brief explanation
- Clarify requirements when AI asks

## Benefits of This Approach

1. **Rapid Development**: AI works autonomously, no waiting
2. **High Quality**: AI tests thoroughly, monitors continuously
3. **Full Traceability**: Git history shows all changes with co-authorship
4. **Maintainability**: MARKOs document decisions and architecture
5. **Human Oversight**: Human reviews and approves critical changes

## Getting Started

1. **First Time Setup**:
   ```bash
   ./setup.sh              # Install dependencies
   ```

2. **Start Development**:
   ```bash
   ./run.sh                # Start application
   python3 dashboard.py    # Monitor (separate terminal)
   ```

3. **Give AI a Task**:
   Just describe what you need in natural language.

4. **Review and Approve**:
   When AI completes work, review and provide feedback or approval.

---

**Remember**: The AI is your autonomous coding partner. Trust it to implement, test, and iterate. Focus on guiding direction and reviewing outcomes. 🤖🤝👤
