# TICKETS
1: wrote docstring for sqlForPartialUpdate
2: Write a unit test for sqlForPartialUpdate
3: add functionality for sqlForPartialUpdate
4: refactor sqlForPartialUpdate
5: route test for GET /companies with query params


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