
module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('Requests', {
    fields: ['analysisID'],
    type: 'foreign key',
    name: 'analysisID_fk',
    references: {
      table: 'Analyses',
      field: 'id',
    },
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),

  down: (queryInterface) => queryInterface.removeConstraint('Requests', 'analysisID_fk'),
};
