module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Analyses', 'explanations', Sequelize.JSON, {
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Analyses', 'explanations', Sequelize.JSON, {}),
};
