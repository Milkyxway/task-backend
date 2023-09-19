// This file is created by egg-ts-helper@1.35.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportHome = require('../../../app/controller/home');
import ExportReport = require('../../../app/controller/report');
import ExportRole = require('../../../app/controller/role');
import ExportTask = require('../../../app/controller/task');

declare module 'egg' {
  interface IController {
    home: ExportHome;
    report: ExportReport;
    role: ExportRole;
    task: ExportTask;
  }
}
