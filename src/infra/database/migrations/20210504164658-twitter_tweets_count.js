'use strict';

const { query } = require("express");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Analyses', 'twitter_status_count', 'twitter_tweets_count');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Analyses', 'twitter_tweets_count', 'twitter_status_count');
  }
};
