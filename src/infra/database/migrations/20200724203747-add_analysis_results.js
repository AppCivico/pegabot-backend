module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Requests', 'analysis_total', { type: Sequelize.STRING, allowNull: true });
    queryInterface.addColumn('Requests', 'analysis_user', { type: Sequelize.STRING, allowNull: true });
    queryInterface.addColumn('Requests', 'analysis_friend', { type: Sequelize.STRING, allowNull: true });
    queryInterface.addColumn('Requests', 'analysis_sentiment', { type: Sequelize.STRING, allowNull: true });
    queryInterface.addColumn('Requests', 'analysis_temporal', { type: Sequelize.STRING, allowNull: true });
    return queryInterface.addColumn('Requests', 'analysis_network', { type: Sequelize.STRING, allowNull: true });
  },
  down: (queryInterface) => {
    queryInterface.removeColumn('Requests', 'analysis_total');
    queryInterface.removeColumn('Requests', 'analysis_user');
    queryInterface.removeColumn('Requests', 'analysis_friend');
    queryInterface.removeColumn('Requests', 'analysis_sentiment');
    queryInterface.removeColumn('Requests', 'analysis_temporal');
    return queryInterface.removeColumn('Requests', 'analysis_network');
  },
};
