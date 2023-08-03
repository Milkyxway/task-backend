// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportCharts = require('../../../app/service/charts');
import ExportRole = require('../../../app/service/role');
import ExportTask = require('../../../app/service/task');

declare module 'egg' {
  interface IService {
    charts: AutoInstanceType<typeof ExportCharts>;
    role: AutoInstanceType<typeof ExportRole>;
    task: AutoInstanceType<typeof ExportTask>;
  }
}
