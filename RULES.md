# Project Rules (for the assistant)

## Source of truth
- Follow `/Users/dobruniakostrigin/front-end/Sona/тз.md`.

## Code quality rules from `тз.md`
- No magic numbers.
- Reusable components.
- Atomic structure.
- Separation of UI and logic.
- TypeScript.
- ESLint + Prettier.
- Clean architecture.

## Additional assistant rules
- Prefer explicit types and narrow validation at boundaries.
- Use descriptive error codes/messages for API responses.
- Keep business logic out of transport layers (GraphQL/HTTP).
- Avoid local stateful singletons unless explicitly required.
- When adding new env vars, document them in `/Users/dobruniakostrigin/front-end/Sona/server/.env.example` and `/Users/dobruniakostrigin/front-end/Sona/README.md`.
- Avoid breaking changes to API without noting it.
