
module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('Feedbacks', {
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

  down: (queryInterface) => queryInterface.removeConstraint('Feedbacks', 'analysisID_fk'),
};
