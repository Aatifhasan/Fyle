// app.js
const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));


const shortprofurl='github.com/caarlos0'
const githubBaseUrl = `https://${shortprofurl}`;
const websiteUrl = `${githubBaseUrl}?tab=repositories`;

const port = 3000;

app.get('/:page?', (req, res) => {
  const currentPage = parseInt(req.params.page) || 1;
  const repositoriesPerPage = 10;

  // Make a GET request to the website
  axios.get(websiteUrl)
    .then(response => {
      const data = response.data;
      const $ = cheerio.load(data);
      const pageTitle = $('.p-name').text();

      const profilePicLink = $('.avatar-user').attr('src');
      // console.log( profilePicLink);
      const bio = $('.user-profile-bio').text()
      // console.log(bio);
     
      const locationText = $('.p-label').text();
      // console.log(locationText);
      

      const repositories = $('h3 a').map(function () {
        const repoLink = $(this).attr('href');
        const repoName = repoLink.split('/').pop(); 
        const fullRepoUrl = `${githubBaseUrl}/${repoName}`;

        return { name: repoName, link: fullRepoUrl };
      }).get();

      
      const startIndex = (currentPage - 1) * repositoriesPerPage;
      const endIndex = startIndex + repositoriesPerPage;
      const paginatedRepositories = repositories.slice(startIndex, endIndex);

      const totalPages = Math.ceil(repositories.length / repositoriesPerPage);

      res.render('index', { pageTitle,
        locationText, bio,shortprofurl,githubBaseUrl, repositories: paginatedRepositories, currentPage, totalPages,profilePicLink });
    })
    .catch(error => {
      console.error('Error fetching data:', error.message);
      res.status(500).send('Internal Server Error');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
