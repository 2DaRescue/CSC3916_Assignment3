[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/41731246-861242bc-908d-468c-a453-ce2b41ba3bd4?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D41731246-861242bc-908d-468c-a453-ce2b41ba3bd4%26entityType%3Dcollection%26workspaceId%3D967c16dc-d8d6-4e6b-98f9-fb8573b5dea3#?env%5Btesting%20hw3%5D=W3sia2V5IjoidXJsIiwidmFsdWUiOiJsb2NhbGhvc3Q6ODA4MCIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0Iiwic2Vzc2lvblZhbHVlIjoibG9jYWxob3N0OjgwODAiLCJjb21wbGV0ZVNlc3Npb25WYWx1ZSI6ImxvY2FsaG9zdDo4MDgwIiwic2Vzc2lvbkluZGV4IjowfSx7ImtleSI6IlRPS0VOIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCIsInNlc3Npb25WYWx1ZSI6IkpXVC4uLiIsImNvbXBsZXRlU2Vzc2lvblZhbHVlIjoiSldUIGV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpwWkNJNklqWTNaRGN6WWpkak56RXlPRFV3TXpWaFkyVTBOVEkyWlNJc0luVnpaWEp1WVcxbElqb2liV2x6ZEdWeU1USXpJaXdpYVdGMElqb3hOelEwTURBd05USTBMQ0psZUhBaU9qRTNORFF3TURReE1qUjkud3d6dFJJT3NWNnVtWUZPUFlJaTJ5UTNxM1c4U2U2bTZ1VU9tV3ZKMExwbyIsInNlc3Npb25JbmRleCI6MX0seyJrZXkiOiJKV1QiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJhbnkiLCJzZXNzaW9uVmFsdWUiOiJudWxsIiwiY29tcGxldGVTZXNzaW9uVmFsdWUiOiJudWxsIiwic2Vzc2lvbkluZGV4IjoyfV0=)

# Assignment Five
## Purpose

The purpose of this assignment is to create a React Single Page App over your developed API.  The interface will allow the users to search for movies, display information about the movie, see stored ratings, and allow the user to enter a rating.

## Pre-Requirements
- Assignment 3 deployed REACT app that supports SignUp and Logon
- Assignment 4 that supports reviews

## Requirements
- Update your API to support storing an image (or image URL) for the movies you have stored.  You will use the image URL in your React application to show the image of movies
    - New Attribute on the movie collection
- For this assignment all your endpoints should be protected by JWT authentication
- Implement the following interfaces
    - User SignUp and User Logon
        - Leverage your User mongoDB collection to store new users of the application
    - Main screen should show the top rated movies (show at least 5)
        - Your GET /movies endpoint should sort by rating (server side)
            - Update your /movies (with reviews=true) endpoint to sort by average rating descending
    - Movie Detail screen, shows the Movie, Image, Actors that were in the movie, aggregated rating for the movie and grid that shows the reviews (username, rating, review)
    - Extra Credit: (7 points) - chapter 25 of (https://www.amazon.com/dp/B0979MGJ5J?_encoding=UTF8&psc=1&ref_=cm_sw_r_cp_ud_dp_M9YGPJNZWB3BK0P59QX3) Movie Search – show results in a grid, accordion or other list control
        - Add Search API (HTTP POST) to the API that can take partial movie names or partial actor names

## Submissions
- User is able to Sign-up (name, username, password)
- User is able to Logon to the application (username, password)
- User is able to see list of movies and select a movie to see the detail screen (top rated movies displayed)
- User is able to enter a review on the detail page (enter a rating and comment) – the logged in user’s username will be associated with the review (as captured from the JSON Web Token)

## Rubic
- -3 Not able to add comments
- -2 Not aggregating rating (average rating)
- -3 if not pointed to correct end point (e.g Hw4 endpoint)
- -5 if you don’t have a react web site deployed 

## Resources
- https://github.com/facebook/create-react-app
- https://github.com/mars/create-react-app-buildpack#user-content-requires

## Resources
- https://www.mongodb.com/cloud/atlas
- Create a Free Subscription *Amazon
- https://render.com/docs/deploy-create-react-app **important: Environment Variable for https://github.com/AliceNN-ucdenver/CSC3916_REACT env.REACT_APP_API_URL, this weekend I will look at changes (I believe only 1 change in the actions)
