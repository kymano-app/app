import { app } from 'electron';

export default () => {
  return app.getPath('userData');
};
