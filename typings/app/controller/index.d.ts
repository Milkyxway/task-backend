// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportCharts = require('../../../app/controller/charts');
import ExportHome = require('../../../app/controller/home');
import ExportRole = require('../../../app/controller/role');
import ExportTask = require('../../../app/controller/task');

declare module 'egg' {
  interface IController {
    charts: ExportCharts;
    home: ExportHome;
    role: ExportRole;
    task: ExportTask;
  }
}
