import { Model } from 'sequelize';

export default class Request extends Model {
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
    }, {
      sequelize,
      modelName: 'Requests',
    });
  }
}
