# issues i found after cloning this repo

i just cloned this repo... its a good project for start but has a lot of issues along with risks to deploy to production.

## logout should work and i shouldnt be logged in by default

i open the app and i am already logged in as "You". i never created an account.
logout just resets the screen, it doesnt really log me out.
- `src/mockData/rides.ts:3` - i am hardcoded as `u0`
- `src/mockData/RidesContext.tsx:83-90` - signOut doesnt clear everything, no login screen after

## why is my ride already confirmed? who confirmed it?

i didnt book anything but profile shows 1 ride confirmed.
no one confirmed it, its just seeded in code.
- `src/mockData/rides.ts:258` - booking for `r1` is already `confirmed`
- `src/screens/RideDetailsScreen.tsx:90-104` - tapping book just confirms by itself, driver never accepts

## who is sarah and why does the chat history already have chats with her when i just git cloned

i never chatted with anyone but chat tab already has chats with sarah mitchell.
she is just mock data, not a real user.
- `src/mockData/rides.ts:11` - sarah is `users[0]`
- `src/mockData/rides.ts:269-294` - 3 sample messages are loaded on start

## what will happen if there is a small spelling mistake?

i tried sydnay instead of sydney and no results. blank screen.
search is exact substring only so any typo = zero rides.
- `src/screens/SearchResultsScreen.tsx:32-46` - `includes()` only, no fuzzy match

## drivers license upload - where is it saved? is it secure? PII risks?

there is option for drivers license upload but nothing is actually uploaded.
it just sets verified = true on my phone. thats risky for production.
phone number also shows Verified just coz i typed something.
- `src/screens/ProfileScreen.tsx:481-507` - modal says demo, no file upload
- `src/mockData/RidesContext.tsx:77-82` - verifyLicense just flips a boolean in AsyncStorage
- `src/screens/ProfileScreen.tsx:157-161` - phone badge is fake too
- PII like name / phone / bio (`@carpool/profile`) and plate (`@carpool/vehicle`) sits in plain AsyncStorage, no encryption. cant put license images there.

## creation of accounts. will mobile number be verified? how? otp based or what?

right now there is no account creation at all. i just type any mobile number in edit profile and it saves.
no otp, no backend, no check. for production i will need real signup + otp verify.
