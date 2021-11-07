var ghpages = require('gh-pages');

ghpages.publish(
  'public', // path to public directory
  {
    branch: 'gh-pages',
    repo: 'https://juliapp.github.io/', // Update to point to your repository
    user: {
      name: 'Juli', // update to use your name
      email: 'aragaopinto@gmail.com', // Update to use your email
    },
    dotfiles: true,
  },
  () => {
    console.log('Deploy Complete!');
  }
);
