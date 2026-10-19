<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Single-user CRM: every table has `user_id default auth.uid()` and an owner-only RLS policy; reads go through the browser client.
- Google Places calls live only in `src/lib/places.functions.ts` (auth-required server fn via connector gateway); the browser key is used only to render Maps JS.
- Shared domain logic (status list, potential score, distance, route ordering) lives in `src/lib/crm.ts` with tests in `crm.test.ts`.
