module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn('Requests', 'origin', Sequelize.STRING, {
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => queryInterface.removeColumn('Requests', 'origin', Sequelize.STRING, {}),
};
