module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn('Requests', 'analysisTotal', { type: Sequelize.STRING, allowNull: true });
    queryInterface.addColumn('Requests', 'analysisUser', { type: Sequelize.STRING, allowNull: true });
    queryInterface.addColumn('Requests', 'analysisFriend', { type: Sequelize.STRING, allowNull: true });
    queryInterface.addColumn('Requests', 'analysisSentiment', { type: Sequelize.STRING, allowNull: true });
    queryInterface.addColumn('Requests', 'analysisTemporal', { type: Sequelize.STRING, allowNull: true });
    return queryInterface.addColumn('Requests', 'analysisNetwork', { type: Sequelize.STRING, allowNull: true });
  },
  down: (queryInterface) => {
    queryInterface.removeColumn('Requests', 'analysisTotal');
    queryInterface.removeColumn('Requests', 'analysisUser');
    queryInterface.removeColumn('Requests', 'analysisFriend');
    queryInterface.removeColumn('Requests', 'analysisSentiment');
    queryInterface.removeColumn('Requests', 'analysisTemporal');
    return queryInterface.removeColumn('Requests', 'analysisNetwork');
  },
};
