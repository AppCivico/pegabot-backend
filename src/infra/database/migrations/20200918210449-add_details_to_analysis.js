module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Analyses', 'details', Sequelize.JSON, {
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Analyses', 'details', Sequelize.JSON, {}),
};
