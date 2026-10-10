# Security Policy

## Reporting Security Vulnerabilities

If you discover a potential security vulnerability in DawaCard Lite, please notify the project maintainers directly via a security advisory or email rather than opening a public issue.

## Local Storage Notice

DawaCard Lite stores data in local browser storage (IndexedDB). Please note:
- Data stored in local browser storage is accessible to anyone with physical access to the browser user profile.
- Browser local storage is not an encrypted database vault.
- Users are advised not to store highly sensitive national identity numbers or private secrets in local storage.

## API Key Security

The frontend bundle must never expose API keys. All external requests to AI services must pass through the backend proxy server (`backend/server.js`), which holds environment configuration variables securely.
