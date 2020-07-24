module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Requests', 'analysisID', Sequelize.INTEGER, {
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Requests', 'analysisID', Sequelize.INTEGER, {}),
};
