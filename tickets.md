# TICKETS
1: DONE: wrote docstring for sqlForPartialUpdate
2: DONE: Write a unit test for sqlForPartialUpdate
3: DONE add functionality for sqlForPartialUpdate

4.0 DONE Build out findBySearch for Company class
    - DONE split into a helper function _getWhereClause()
    - DONE: Write out docstring for _getWhereClause()
    - DONE write out tests for our _getWhereClause()

5: DONE route test for GET /companies with query params

6: DONE add jsonSchema for validating data of the req.query in companies route

7: GET / Add any finishing touches to the route to filter.
    - `Object.keys(req.query).length > 0` make sure req.query isn't a false positive for
    an empty {}

8: DONE Add ensureCorrectUserOrAdmin to middleware

9: DONE /companies update the docstrings for all routes that require being an admin

10: DONE /companies update tests to reflect admin checks

11: TODO: in helpers/sql.js
    - Specify at a high level what is going on and why we need it

12: DONE: in company.test.js for models
    - Add test for empty {} that throws 400

13: organize tests with describe of failures
    Describes can be nested and can be organized as follows
    - Working
    - Edge cases
    - 400's

14: DONE in companies route:
    - Invert the `if (Object.keys(req.query).length > 0)`
    That way the else is not forgotten by the time we read 50 lines of code.

15: DONE We can copy the req.query and then pass that to our json validator
    - We can copy this as `const query = req.query;`
    because Express has a getter for query that returns a new object NOT a reference to req.query!
    - Then we can get rid of a lot of if cases and only keep the Number() change

16: DONE Update the /users docstrings and add middleware

17: DONE Add corrected tests for routes/users.test.js

18: DONE: change `u4Token` to `adminToken`

19: add tests for job model

20: make model for job
    Requirements:
        - Updating a job should never change the ID of a job, nor the company associated with a job.

21: add tests for job routes

21: add routes for jobs

# QUESTIONS
1: what is the server.test.js doing?
    - Why would it crash?
    ANSWER: This is a smoke test. Very obscure functions: mockImplementation
        Smoke test: if you turn it on, and it smokes, it is fucked and didn't even start
        It is a bare minimum that it least turns on "is this running?"

2: `/* istanbul ignore next (ignore for coverage) */`
    - Does this ignore the rest of the function or only the next line?
     ANSWER: only the next line

3: ```set("authorization", `Bearer ${u1Token})```
    - What is happening here?
    ANSWER: `bearer` is a conventional name for the token name / header for the token.
    In insomnia, we can use the dropdown for Auth to put an auth token "Bearer" token

4: users.js route
    - why does `/users/` and `/users` both work?
      - Probably Insomnia "Accept: */*" header
      ANSWER: Yes.

5: What is `Branch` in the test:cov?
    We are getting no coverage for errs when we run sql.test.js. What's happening?
    ANSWER: we have a secret key in .env

6: Why does findBySearch test throw the BadReqErr if we don't have anything written
    for the function?
        -  ✓ throws BadRequestError: empty search parameters
            ✓ throws BadRequestError: minEmployees > maxEmployees
        ANSWERS:  Force it to fail! No false positives
        `throw new Error("fail test, you shouldn't get here");`

7: Why is `num_employees` in companies table nullable?
    ANSWER: Watch for nullable feels! Add them to docs

8: Why do some JSON schemas have `"required": []` (empty required array)
    ANSWER: For clarification for other devs working on the project

9: Should ensureAdmin also check if a user is logged in?
    ANSWER: yes, it's a valid choice. Reduces the amount of middleware needed
    to validate an admin user, and avoids issues of middleware function order.

10: How do we use ``istanbul``?
    ANSWER: we don't! that was for `jest` and we are now using v8. We can use  `/* v8 ignore next 3 */`


# SKILLs
1: you can change the color of your logs

2: `expect(err instanceof BadRequestError).toBeTruthy();`
    - Good way to test that we have the right errors
    Force it to fail! No false positives
    `throw new Error("fail test, you shouldn't get here");`

3: helper route for common beforeEach etc.
    - _testCommon.js

    - Starting a transation in a test
``` js

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}
```

4: You can change the source control to view as tree

5: testing next()

``` js
//import vi from vitest
function innerNext(err) {
  if (err) throw new Error("Got error from middleware");
}
// make me a function, this will auto spy on innerNext, and confirm that
// next ran x amount of times in the tested middleware function.
const next = vi.fn(innerNext)
```