# tasks to make it barely working

its a good start but i cant even call it working yet. these are just tasks, not phases. no commits yet.

## task 1. fix login / logout
i shouldnt be logged in by default. i need a real signup + login screen.
logout should actually log me out and clear everything and take me to login.

## task 2. fix bookings and chat
no more auto confirmed rides. booking should go as pending and driver should accept.
no more chats with sarah on fresh clone. new user should see empty inbox.

## task 3. fix search for spelling mistakes
if i type sydnay instead of sydney it should still find sydney or suggest did-you-mean.
need fuzzy search, not exact match.

## task 4. fix license upload and PII
right now upload saves nothing and just marks me verified. thats not secure.
i need proper upload to secure backend, not AsyncStorage. and clear policy for PII.

## task 5. fix accounts and mobile verification
need proper account creation. mobile number should be verified with otp based flow,
not just typing anything in a text box.

i will do task 1 -> 2 -> 3 -> 4 -> 5. only after that i will think about phases and deploy.
per AGENTS.md i will use https://docs.expo.dev/versions/v57.0.0/ for any expo work.
