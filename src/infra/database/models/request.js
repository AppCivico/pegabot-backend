import { Model } from 'sequelize';

const requestModel = class Request extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      screenName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      gitHead: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysisID: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      userDataID: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      apiDataID: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      cachedRequestID: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
    }, {
      sequelize,
      modelName: 'Requests',
    });
  }
};

requestModel.associate = (models) => {
  requestModel.hasOne(models.Analysis, {
    as: 'analysis', foreignKey: 'id', sourceKey: 'analysisID', onDelete: 'CASCADE', onUpdate: 'CASCADE',
  });

  requestModel.hasOne(models.UserData, {
    as: 'userdata', foreignKey: 'id', sourceKey: 'userDataID', onDelete: 'CASCADE', onUpdate: 'CASCADE',
  });

  requestModel.hasOne(models.ApiData, {
    as: 'apidata', foreignKey: 'id', sourceKey: 'apiDataID', onDelete: 'CASCADE', onUpdate: 'CASCADE',
  });
};

export default requestModel;
