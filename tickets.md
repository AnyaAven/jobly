# TICKETS
1: Write a unit test for sqlForPartialUpdate



# QUESTIONS
1: what is the server.test.js doing?
    - Why would it crash?
2: `/* istanbul ignore next (ignore for coverage) */`
    - Does this ignore the rest of the function or only the next line?
3: ```set("authorization", `Bearer ${u1Token})```
    - What is happening here?
4: users.js route
    - why does `/users/` and `/users` both work?
      - Probably Insomnia "Accept: */*" header

# SKILLs
1: you can change the color of your logs

2: `expect(err instanceof BadRequestError).toBeTruthy();`
    - Good way to test that we have the right erros
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