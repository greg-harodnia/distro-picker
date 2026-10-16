Rules for AI agents:

1. use Bun
2. keep in mind Vercel and Supabase are used on the server
3. Don't duplicate code if possible
4. Simplify code where possible
5. If you change some previously written code for a new feature, consider reimplementing its architecture knowing now that it has to work with new features (if makes sense)
6. Editing old code for new features should not stockpile and bloat it, consider rewriting old code for less code, less duplication and better architecture based on the current state of the project (it wasn't the same when the old code was written)
7. If you add a new feature and change an old one for it, but the old feature implementation "limits" the new feature, don't just adapt to those limits but think of changing old features so that they better work with the new ones. Don't be passive, be active (but ask the user permission if the unrequested change is significant)
8. SEO and performance are important
9. If you are asked to do something but there is a better way to do it, propose those ways instead of blindly doing what is not best