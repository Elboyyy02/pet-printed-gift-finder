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

## Gift finder
- Keep the official catalog as a curated, dated client-safe snapshot in `src/lib/gift-catalog.ts`, with store product URLs and CDN asset pointers; this avoids inventing products or requiring a store API at runtime.
- Keep recommendation rules in `src/lib/gift-matching.ts` and test strict pet, memorial, and real variant-price budget eligibility; unmatched combinations must not silently violate shoppers' answers.
