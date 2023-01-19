# Contributing Guidelines

### Communication Channels

For open discussions, we encourage you to use [Discord](https://discord.gg/j5K9fESNwh)

### Notice a bug?

If you find a bug while working with the marketplace, you can help us by submitting an issue [here](https://github.com/reservoirprotocol/marketplace/issues). Additionally you can follow the steps below to open a pull request that fixes the issue.

Before you open an issue please ensure that there's no existing issue that's either closed or open. There may already be an issue that addresses the bug you've encountered.

### Getting Started

1. **Fork the main repo**

    Forking the repo will create a clone or copy of it in your account. When your changes are merged upstream this will help us to understand the changes you implemented.

2. **Clone the repository locally**

    Clone the forked repository on your machine. Replace {USERNAME} with your github username.

    `git clone https://github.com/{USERNAME}/marketplace.git`

3. **Create a branch**

    `git checkout -b feature/NAME_OF_BRANCH`

    If there's an issue that you're working on, open a new branch with the following format:

    `TICKET_ID/DESCRIPTIVE_SHORT_NAME`

    The ticket id is the issue number and the descriptive short name is a short description of the work done. For example:

    `217/community-background-color`

    If there is no issue created yet use the `feature/` or `fix/` prefix and the descriptive short name.

4. **Make the necessary changes and commit them with a short descriptive message.**

   ```
   git add -A
   git commit -m "Changed the community background color"
   ```

5. **Push the changes**

    `git push origin {YOURBRANCHNAME}`

6. **Open a pull request to the main repo**

    Go to the forked project and click on Compare & pull request. You'll see a create pull request button, click on that. Your changes will be submitted for review. Keep an eye on your pull request as the core team and community will be adding comments to your PR.
