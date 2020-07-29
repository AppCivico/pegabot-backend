
module.exports = {
  up: (queryInterface) => queryInterface.addConstraint('Requests', {
    fields: ['cachedRequestID'],
    type: 'foreign key',
    name: 'cachedRequestID_fk',
    references: {
      table: 'CachedRequests',
      field: 'id',
    },
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),

  down: (queryInterface) => queryInterface.removeConstraint('Requests', 'cachedRequestID_fk'),
};
