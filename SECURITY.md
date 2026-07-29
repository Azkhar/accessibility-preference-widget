# Security Policy

## Supported versions

Until the first public release is tagged, only the latest state of the default branch is intended to receive security fixes.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting feature after the repository is created. If that feature is unavailable, contact the repository owner through a private channel listed in the future GitHub organization profile.

Do not open a public issue containing:

- API keys, tokens, passwords, or private URLs
- customer names, records, or page content
- exploit details that would put deployed sites at immediate risk

Include a minimal reproduction, affected version, impact, and suggested mitigation. Use synthetic data only.

## Project security boundary

The public core contains no license verification, customer service, proprietary API adapter, or sign-language video integration. Contributions that introduce network communication must document the destination, transmitted data, consent model, Content Security Policy requirements, and failure behavior before review.

The widget changes host-page presentation. Integrators must review the bundle, pin a release, apply their own Content Security Policy, and test it in their application context.
