import Sequelize from 'sequelize';
import RequestModel from './models/request';
import AnalysisModel from './models/analyses';
import UserDataModel from './models/userdata';
import ApiDataModel from './models/apidata';
import CachedRequestsModel from './models/cachedRequests';
import Config from './config';

const env = process.env.NODE_ENV || 'development';
const config = Config[env];

let sequelizeArgs;
if (config.use_env_variable) {
  sequelizeArgs = [process.env[config.use_env_variable], config];
} else {
  sequelizeArgs = [config.database, config.username, config.password, config];
}

const sequelize = new Sequelize(...sequelizeArgs);
const models = {
  Request: RequestModel.init(sequelize, Sequelize),
  Analysis: AnalysisModel.init(sequelize, Sequelize),
  UserData: UserDataModel.init(sequelize, Sequelize),
  ApiData: ApiDataModel.init(sequelize, Sequelize),
  CachedRequest: CachedRequestsModel.init(sequelize, Sequelize),
};

Object.values(models)
  .filter((model) => typeof model.associate === 'function')
  .forEach((model) => model.associate(models));

const {
  Request, Analysis, UserData, ApiData, CachedRequest,
} = models;

export {
  sequelize, Sequelize, Request, Analysis, UserData, ApiData, CachedRequest,
};
