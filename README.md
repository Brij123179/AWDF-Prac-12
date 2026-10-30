# Practical 12: CI/CD Pipeline with GitHub Actions

[![CI Pipeline](https://github.com/Brij123179/AWDF-Prac-12/actions/workflows/ci.yml/badge.svg)](https://github.com/Brij123179/AWDF-Prac-12/actions/workflows/ci.yml)
[![Tests: 4 Passed](https://img.shields.io/badge/tests-4%20passed-brightgreen.svg)](https://github.com/Brij123179/AWDF-Prac-12)
[![Linter: Passed](https://img.shields.io/badge/linter-clean-blue.svg)](https://github.com/Brij123179/AWDF-Prac-12)
[![Node: v18.x](https://img.shields.io/badge/node-v18.x-purple.svg)](https://nodejs.org)
[![Course: ITUE301](https://img.shields.io/badge/course-ITUE301-orange.svg)](https://charusat.ac.in)

> **Charotar University of Science and Technology (CHARUSAT)**  
> **Faculty of Technology and Engineering (FTE)**  
> **Department of Information Technology / Computer Engineering**  
> **Course:** Advanced Web Development Frameworks (`ITUE301`)  
> **Student Name:** Brij Patel  
> **Repository:** [https://github.com/Brij123179/AWDF-Prac-12](https://github.com/Brij123179/AWDF-Prac-12)

---

## 🎯 Course Outcomes & Program Outcomes Mapping

| Parameter | Details |
| :--- | :--- |
| **Course Outcome (CO)** | **CO5**: Automate testing and deployment of modern web applications using continuous integration and delivery pipelines. |
| **Program Outcomes (PO)** | **PO3** (Design/development of solutions), **PO5** (Modern tool usage). |
| **Cognitive Level** | Applying (Level 3), Analyzing (Level 4). |

---

## 📋 Table of Contents
1. [Objective & Problem Statement](#-objective--problem-statement)
2. [CI/CD Architecture & Workflow Graph](#-cicd-architecture--workflow-graph)
3. [Key Questions & Analysis](#-key-questions--analysis)
4. [Supplementary Problems Implemented](#-supplementary-problems-implemented)
5. [Implementation Walkthrough](#-implementation-walkthrough)
   - [Automated REST API Test Suite](#1-automated-rest-api-test-suite)
   - [Linter & Code Quality Validation](#2-linter--code-quality-validation)
   - [GitHub Actions Workflow Configuration](#3-github-actions-workflow-configuration)
   - [Deliberate Failure & Fix Demonstration](#4-deliberate-failure--fix-demonstration)
6. [Visual Evidence & Screenshots](#-visual-evidence--screenshots)
7. [Troubleshooting Guide](#-troubleshooting-guide)
8. [Viva Voce Questions & Answers](#-viva-voce-questions--answers)
9. [How to Run Locally](#-how-to-run-locally)

---

## 🎯 Objective & Problem Statement

### Objective
To automate testing, static code analysis, and production build verification of the Task Management application using a GitHub Actions Continuous Integration (CI) pipeline.

### Problem Statement
1. Set up a GitHub Actions workflow (`.github/workflows/ci.yml`) for the full-stack Task Management application that triggers automatically on every `push` and `pull_request` targeting the `main` branch.
2. The pipeline must install clean dependencies (`npm install`) as a formal prerequisite step.
3. The pipeline must execute an automated REST API test suite covering critical endpoints (`GET /api/health`, `GET /api/tasks`, `POST /api/tasks`, `DELETE /api/tasks/:id`) and report unambiguous pass/fail status.
4. Demonstrate a pipeline failure (Red X) caused by a deliberately broken test assertion, examine logs, and demonstrate pipeline recovery (Green checkmark) upon correction.
5. Fulfill all supplementary challenges: add a sequential code linter job before tests, support pull request triggers, and embed active pipeline status badges.

---

## 🏗️ CI/CD Architecture & Workflow Graph

```
                   Developer Workflow
             ┌─────────────────────────────┐
             │ git commit -m "feat: ..."   │
             │ git push origin main        │
             │   (or Pull Request)         │
             └──────────────┬──────────────┘
                            │ Webhook Event
                            ▼
              GitHub Actions CI Runner (Ubuntu)
             ┌─────────────────────────────┐
             │  Trigger: on [push, PR]     │
             └──────────────┬──────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Job 1: 🔍 lint (Code Quality)       │
         │ ├── 📥 actions/checkout@v4          │
         │ ├── ⚙️ actions/setup-node@v4 (v18)   │
         │ ├── 📦 npm install (backend)        │
         │ └── 🚨 npm run lint                 │
         └──────────────────┬──────────────────┘
                            │ needs: lint (PASSED)
                            ▼
         ┌─────────────────────────────────────┐
         │ Job 2: 🧪 build-and-test            │
         │ ├── 📥 actions/checkout@v4          │
         │ ├── ⚙️ actions/setup-node@v4 (v18)   │
         │ ├── 📦 npm install (backend & UI)   │
         │ ├── 🧪 npm test (4 REST API tests)  │
         │ └── 🏗️ npm run build (Vite bundle)  │
         └──────────────────┬──────────────────┘
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
       [Tests Failed]                [Tests Passed]
     ❌ Pipeline: Red X           ✅ Pipeline: Green Check
   (Deployment Prevented)         (Safe to Merge / Release)
```

---

## 💡 Key Questions & Analysis

### Q1: What is the difference between Continuous Integration and Continuous Deployment, and which one does this practical actually demonstrate?
* **Continuous Integration (CI)**: The automated practice where developers frequently merge code changes into a central repository, after which automated builds, linters, and unit/integration tests run immediately. The sole goal of CI is to detect integration bugs early and ensure that the codebase on `main` is always in a healthy, compilable, and tested state.
* **Continuous Delivery (CD)**: Automates the entire release process so that any green build passing CI can be released to staging or production with a single click.
* **Continuous Deployment (CD)**: Goes a step further by automatically pushing every build that passes all CI stages directly into production without manual human intervention.
* **What This Practical Demonstrates**: This practical demonstrates **Continuous Integration (CI)**. It defines automated triggers on `push` and `pull_request`, checks out fresh environments, installs dependencies, runs static linting, executes integration test suites, and verifies frontend bundling. It acts as the automated quality gate before any deployment stage.

### Q2: Why does running tests automatically on every push catch problems earlier than testing manually before a release?
1. **Immediate Feedback Loop ("Shift-Left Testing")**: When tests run on every push, a developer receives feedback within 30 to 60 seconds of pushing their commit. If a bug is introduced, the developer knows the exact commit and line of code that caused the regression while the mental context is still fresh.
2. **Defeating "Merge Hell"**: Manual testing before release usually occurs weeks or months after code is written. By then, dozens of interdependent features have been combined, making root-cause analysis exponential in complexity.
3. **Reproducible Environment**: Manual testing on developer laptops suffers from the *"works on my machine"* syndrome due to ambient state, global packages, or uncommitted files. CI runs in pristine, standardized containerized runners (`ubuntu-latest`) every single time.
4. **Preventing Broken Commits on Shared Branches**: Automated CI branch protection rules can physically block merges until all tests pass, ensuring broken code never pollutes `main`.

### Q3: What would happen to the pipeline if the test file path were incorrect—would the workflow fail at the same step as a genuine test failure?
* **Same Workflow Step**: Yes, it fails at the same workflow step: `Run REST API Automated Test Suite` (`npm test`).
* **Different Exit Root Cause and Diagnostic Signature**:
  - When the **test file path is incorrect** (e.g., pointing to `tests/missing.test.js`), Node.js or Jest terminates with an input/output module resolution error (`ERR_MODULE_NOT_FOUND` or `ENOENT: no such file or directory`) with exit code 1. Zero tests are executed, and no test assertion output is generated.
  - When a **genuine test fails**, the test framework successfully loads the test file, executes the test functions, and encounters an assertion discrepancy (e.g., `AssertionError: 200 !== 500`). The test runner outputs detailed failure traces, actual vs expected values, and TAP/JUnit summaries before exiting with code 1.
* **CI Log Difference**:
  ```
  Path Error:    Cannot find module '/home/runner/work/.../tests/wrong.test.js'
  Genuine Error: not ok 1 - Deliberate Failure: expected 500, received 200 (AssertionError)
  ```

---

## 🚀 Supplementary Problems Implemented

### 1. Sequential Linter Job (`lint` before `build-and-test`)
- Created `Practical-12/backend/lint.js` to execute static validation of required configuration files, directory structures, and JSON parsing before tests run.
- Configured Job 2 (`build-and-test`) with `needs: lint` in `.github/workflows/ci.yml`. If the linter job fails, the test runner job never executes, conserving CI runner minutes.

### 2. Pull Request Target Trigger
- Workflow triggers on both `push` and `pull_request` branches targeting `main`:
  ```yaml
  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]
  ```

### 3. Dynamic GitHub CI Status Badge
- Integrated Markdown status badge linked to the GitHub Actions workflow at the very top of `README.md`:
  ```markdown
  [![CI Pipeline](https://github.com/Brij123179/AWDF-Prac-12/actions/workflows/ci.yml/badge.svg)](https://github.com/Brij123179/AWDF-Prac-12/actions/workflows/ci.yml)
  ```

---

## 🛠️ Implementation Walkthrough

### 1. Automated REST API Test Suite
Located at `Practical-12/backend/tests/api.test.js`:
- Uses Node.js native test runner (`node:test`) and strict assertions (`node:assert`).
- Dispatches in-process HTTP requests via `Practical-12/backend/tests/caller.js` without external network dependencies, ensuring lightning-fast execution in CI environments.
- 4 Comprehensive Test Cases:
  1. `GET /api/health`: Asserts status `200` and `status: "UP"`.
  2. `GET /api/tasks`: Asserts status `200` and tasks array structure.
  3. `POST /api/tasks`: Asserts status `201` and payload creation.
  4. `DELETE /api/tasks/:id`: Asserts status `200` upon deletion.

### 2. Linter & Code Quality Validation
Located at `Practical-12/backend/lint.js`:
- Verifies existence of required files (`server.js`, `package.json`, `.env.example`, controllers, routes).
- Verifies syntax integrity of `package.json`.
- Validates that sensitive `.env` files are excluded from source control.

### 3. GitHub Actions Workflow Configuration
Located at `.github/workflows/ci.yml`:
```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    name: 🔍 Code Quality & Linter
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4
      - name: ⚙️ Setup Node.js 18
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: 📦 Install Backend Dependencies
        run: |
          if [ -d "Practical-12/backend" ]; then cd Practical-12/backend; else cd backend; fi
          npm install
      - name: 🚨 Run Automated Linter & Structure Validation
        run: |
          if [ -d "Practical-12/backend" ]; then cd Practical-12/backend; else cd backend; fi
          npm run lint

  build-and-test:
    name: 🧪 Automated Test Suite & Build
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout Repository
        uses: actions/checkout@v4
      - name: ⚙️ Setup Node.js 18
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: 📦 Install Backend Dependencies
        run: |
          if [ -d "Practical-12/backend" ]; then cd Practical-12/backend; else cd backend; fi
          npm install
      - name: 🧪 Run REST API Automated Test Suite
        run: |
          if [ -d "Practical-12/backend" ]; then cd Practical-12/backend; else cd backend; fi
          npm test
      - name: 🏗️ Verify Frontend Build
        run: |
          if [ -d "Practical-12/frontend" ]; then cd Practical-12/frontend; else cd frontend; fi
          npm install
          npm run build
```

### 4. Deliberate Failure & Fix Demonstration
To fulfill Step 5 of the syllabus guidelines:
1. Created `Practical-12/backend/tests/broken.test.js`:
   ```javascript
   test('Deliberate Failure: Expecting status 500 from healthy GET /api/health', async () => {
     const res = await request('get', '/api/health');
     assert.strictEqual(res.statusCode, 500); // 200 !== 500
   });
   ```
2. Running `npm run test:broken` produces exit code 1 and triggers an immediate **Red X** on GitHub Actions.
3. Running `npm test` runs the corrected assertions, exits with code 0, and turns the pipeline **Green Checkmark**.

---

## 📸 Visual Evidence & Screenshots

| Screenshot | Description | File Link |
| :--- | :--- | :--- |
| **01. CI Pipeline Passed** | GitHub Actions UI showing successful completion of `lint` and `build-and-test` jobs with Green Checkmark. | [View Screenshot](file:///E:/AWDF/Practical-12/ss/01_ci_pipeline_passed.png) |
| **02. Deliberate Failure (Red X)** | GitHub Actions UI showing halted pipeline and failed assertion trace on `broken.test.js`. | [View Screenshot](file:///E:/AWDF/Practical-12/ss/02_ci_pipeline_failed_red_x.png) |
| **03. Test Suite Terminal** | Local CLI output showing all 4 tests passing in 74.95ms. | [View Screenshot](file:///E:/AWDF/Practical-12/ss/03_test_suite_terminal.png) |
| **04. Linter Terminal** | Static file and security verification executed by `npm run lint`. | [View Screenshot](file:///E:/AWDF/Practical-12/ss/04_lint_job_terminal.png) |
| **05. Status Badge** | Active build badge rendering in GitHub repository header. | [View Screenshot](file:///E:/AWDF/Practical-12/ss/05_github_status_badge.png) |
| **06. Workflow DAG Graph** | GitHub Actions job dependency graph showing `lint` gating `build-and-test`. | [View Screenshot](file:///E:/AWDF/Practical-12/ss/06_pipeline_workflow_editor.png) |

---

## 🔧 Troubleshooting Guide

| Symptom | Likely Cause | Fix |
| :--- | :--- | :--- |
| **Workflow does not appear under Actions tab** | File is not located at `.github/workflows/ci.yml` or has invalid file extension (`.yaml` mismatch). | Verify exact path `.github/workflows/ci.yml`, commit and push to remote. |
| **Workflow fails immediately with YAML syntax error** | Tab characters used instead of spaces or incorrect indentation. | YAML is indentation-sensitive. Use consistent 2-space indentation and replace tabs with spaces. |
| **`npm test` fails with `no test specified`** | `package.json` missing `"test"` entry in scripts block. | Ensure `"scripts": { "test": "node --test tests/api.test.js" }` is present in `package.json`. |
| **Pipeline passes even with a broken test** | Test does not contain an assertion (`assert.strictEqual`) or uses asynchronous calls without `await`. | Ensure every test returns or awaits the assertion promise so unhandled rejections trigger failure. |

---

## 🎓 Viva Voce Questions & Answers

### 1. What is GitHub Actions and how is it structured?
**Answer:** GitHub Actions is a continuous integration and continuous delivery (CI/CD) platform integrated directly into GitHub. It is structured hierarchically:
- **Workflows**: Automated YAML processes placed in `.github/workflows/`.
- **Events/Triggers**: Webhook events that invoke the workflow (`push`, `pull_request`, `schedule`).
- **Jobs**: Sets of steps executing on a shared virtual runner (`runs-on: ubuntu-latest`). Jobs run in parallel by default unless ordered via `needs: [job_name]`.
- **Steps**: Individual tasks executing either shell commands (`run: ...`) or reusable community actions (`uses: actions/checkout@v4`).

### 2. What is the significance of `actions/checkout@v4`?
**Answer:** By default, GitHub Actions runners start as clean, empty virtual machines or containers. The `actions/checkout@v4` action clones the repository's git history into the runner's workspace (`$GITHUB_WORKSPACE`), allowing subsequent build and test commands to access application files.

### 3. What does `npm ci` do compared to `npm install` in a CI pipeline?
**Answer:** `npm ci` (Clean Install) installs dependencies directly from `package-lock.json` and deletes any existing `node_modules`. It enforces strict version synchronization, throws an error if `package.json` and `package-lock.json` are out of sync, and runs substantially faster because it skips dependency resolution.

### 4. How do you prevent sensitive secrets (e.g. database credentials, JWT keys) from leaking in a CI pipeline?
**Answer:** Secrets must never be hardcoded into YAML files or pushed to the repository. They should be configured under **Repository Settings → Secrets and variables → Actions** as encrypted secrets and injected into runner environment variables using the `secrets` context:
```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## 💻 How to Run Locally

### Run Static Linter
```bash
cd backend
npm run lint
```

### Run Automated Test Suite
```bash
cd backend
npm test
```

### Run Deliberate Failure Test (Observe Red X)
```bash
cd backend
npm run test:broken
```

---
*Developed for CHARUSAT B.Tech ITUE301 Advanced Web Development Frameworks Course.*
