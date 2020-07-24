module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Requests', 'analysisResponse', { type: Sequelize.JSON, allowNull: true },
  ),
  down: (queryInterface) => queryInterface.removeColumn('Requests', 'analysisResponse'),
};
