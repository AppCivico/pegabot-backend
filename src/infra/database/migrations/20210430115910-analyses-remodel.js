'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Analyses', 'explanations');
    await queryInterface.removeColumn('Analyses', 'details');
    await queryInterface.removeColumn('Analyses', 'fullResponse');

    await queryInterface.addColumn('Analyses', 'twitter_user_id', { type: Sequelize.BIGINT });
    await queryInterface.addColumn('Analyses', 'twitter_handle', { type: Sequelize.STRING });
    await queryInterface.addColumn('Analyses', 'twitter_following_count', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('Analyses', 'twitter_followers_count', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('Analyses', 'twitter_status_count', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('Analyses', 'twitter_created_at', { type: Sequelize.DATE });
    await queryInterface.addColumn('Analyses', 'origin', { type: Sequelize.STRING });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Analyses', 'explanations', { type: Sequelize.JSON });
    await queryInterface.addColumn('Analyses', 'details', { type: Sequelize.JSON });
    await queryInterface.addColumn('Analyses', 'fullResponse', { type: Sequelize.JSON });
    await queryInterface.removeColumn('Analyses', 'twitter_user_id');
    await queryInterface.removeColumn('Analyses', 'twitter_handle');
    await queryInterface.removeColumn('Analyses', 'twitter_created_at');
    await queryInterface.removeColumn('Analyses', 'twitter_following_count');
    await queryInterface.removeColumn('Analyses', 'twitter_followers_count');
    await queryInterface.removeColumn('Analyses', 'twitter_status_count');
    await queryInterface.removeColumn('Analyses', 'origin');
  }
};
