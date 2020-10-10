module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Requests', 'gitHead', { type: Sequelize.STRING, allowNull: true },
  ),
  down: (queryInterface) => queryInterface.removeColumn('Requests', 'gitHead'),
};
