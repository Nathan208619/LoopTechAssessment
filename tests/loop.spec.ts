import { test, expect } from '@playwright/test';
import testData from './testData.json';

testData.forEach((data) => {
  test(`verify task: ${data.task}`, async ({ page }) => { // create playwright test and open browser tab

    // LOGIN, shared logic for each testcase (Step 1z)
    await page.goto('https://animated-gingersnap-8cf7f2.netlify.app/'); // got to the site
    await page.fill('input[type="text"]', 'admin'); // input the username
    await page.fill('input[type="password"]', 'password123'); // input password
    await page.click('button[type="submit"]'); // click submit button to login

    // Navigate to board (Step 2)
    await page.click(`text=${data.board}`); // click element on the side panel with a name matching the board element

    // Verify that a certain task is present within a specific column (Step 3)
    const taskCard = page.getByRole('heading', { // search for header matching the task name to locate the task card
      name: data.task
    });

    await expect(taskCard).toBeVisible(); // confirm the task card is visible

    // once a task card is verified, move backwards to find the header of the container it sits within.
    const columnName = await taskCard.evaluate((element) => {

      let current = element.parentElement; // set current element to the parentelment of our current element

      while (current) { // use loop to move backwards checking elements until we find h2

        const heading = current.querySelector('h2'); // checks if container has an h2 element

        if (heading) {
          return heading.textContent; // if we find it, return its text, this is the column name
        }

        current = current.parentElement; // update current element to its parent element 
      }

      return null; // otherwise return null
    });

    expect(columnName).toContain(data.column); // check if the name we found matches the column name for the test case

    // Verify that specific set of tags is attached to each task card (Step 4)
    for (const tag of data.tags) { // loop to check for each tag in the list of tags

      const tagCardContainer = page.getByRole('heading', { // search for header matching the task name to locate the task card
        name: data.task
      }).locator('..'); // move up one level because task cards and tags are sibling elements, so they are at the same level

      // once we have found the right task card and we move up one level, we know we are in the container with that 
      // task card and its tags

      // check container for text matching the current tag and verify that it is visible
      await expect(
        tagCardContainer.getByText(tag, { exact: true })
      ).toBeVisible();
    }
  });
});