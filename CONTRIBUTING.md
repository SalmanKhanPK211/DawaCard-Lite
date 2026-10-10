# Contributing to DawaCard Lite

Thank you for your interest in contributing to DawaCard Lite! We welcome community contributions, bug reports, and feature proposals.

## Development Workflow

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify tests pass before submitting code:
   ```bash
   npm test
   ```
4. Commit your changes following clear commit messages.
5. Push your branch and open a Pull Request.

## Core Rules

- **Privacy & Safety First:** Never commit real patient health information or live API secrets. Use fictional sample data in unit tests.
- **Local-First Core:** Do not add cloud databases or authentication requirements to the MVP architecture.
- **Human Verification:** Never bypass the mandatory user confirmation step for AI prescription extraction.
