#OpenObserve QA Automation Assignment

Overview
This project demonstrates end-to-end UI and API automation for the OpenObserve platform.

It covers:
- Dashboard creation and validation
- Pipeline creation using drag and drop nodes
- Stream ingestion and validation
- API testing for backend validation


Tech Stack

UI Automation:
- Playwright (TypeScript)
- Page Object Model (POM)
- Custom reusable utilities

API Testing:
- Pytest (Python)
- Requests library


Project Structure

openobserve-qa-assignment/

api-tests/
  tests/
    test_logs.py
  utils/
  conftest.py
  pytest.ini
  requirements.txt

ui-tests/
  pages/
    base/
    home/
    login/
    settings/
    sidebar/
      alerts.page.ts
      logs.page.ts
      pipeline.page.ts
      streams.page.ts

  tests/
  utils/
  test-data/
  playwright.config.ts
  package.json

test-results/
playwright-report/


Setup Instructions

1. Clone Repository
git clone <repo-url>
cd openobserve-qa-assignment


2. UI Setup (Playwright)
cd ui-tests
npm install
npx playwright install


3. API Setup (Python)
cd api-tests
pip install -r requirements.txt


Running Tests

UI Tests:

Run all tests:
cd ui-tests
npx playwright test

Run specific test:
npx playwright test tests/pipeline.spec.ts

Run in headed mode:
npx playwright test --headed

Debug mode:
npx playwright test --debug


API Tests:

cd api-tests
pytest -v


Reports

Playwright report:
npx playwright show-report

Report location:
ui-tests/playwright-report/


UI Test Coverage

Dashboard Module:
- Create dashboard
- Add table panel
- Select stream and fields
- Apply and save panel
- Validate table data

Pipeline Module:
- Create source and destination streams
- Drag and drop nodes to canvas
- Remove default destination node
- Connect source to destination
- Save pipeline
- Ingest data into source stream
- Validate data in destination stream


API Test Coverage

- Log ingestion API
- Response validation
- Data verification


Key Highlights

- Dynamic locators used for stability
- Drag and drop handled for Vue Flow canvas
- No hard waits, proper wait mechanisms used
- Clean Page Object Model design
- Reusable utilities implemented
- Scalable automation framework


Ignored Files

node_modules/
test-results/
playwright-report/
venv/
__pycache__/
.pytest_cache/

Notes

- Designed for real-world automation scenarios
- Easily extendable
- Supports CI/CD integration