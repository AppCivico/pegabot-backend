import { Model } from 'sequelize';

const CacheModel = class Cache extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      analysis_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: { model: 'Analyses', key: 'id' }
      },
      simple_analysis: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      full_analysis: {
        allowNull: true,
        type: DataTypes.TEXT,
      }
    }, {
      sequelize,
      modelName: 'cache',
      freezeTableName: true,
    });
  }
}

CacheModel.associate = (models) => {
  CacheModel.belongsTo(models.Analysis, {
    as: 'analysis', foreignKey: 'id', sourceKey: 'analysisID', onDelete: 'CASCADE', onUpdate: 'CASCADE',
  });
};

export default CacheModel;