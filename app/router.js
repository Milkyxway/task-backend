'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  /**
	 * 任务列表增删改查
	 */
  router.post('/api/task/list', controller.task.query);
  router.post('/api/task/add', controller.task.add);
  router.delete('/api/task/delete', controller.task.delete);
  router.put('/api/task/update', controller.task.update);
  router.put('/api/task/finish', controller.task.setFinish);
  router.post('/api/task/detail', controller.task.detail);
  router.post('/api/task/appeal', controller.task.appeal);
  router.post('/api/task/mine', controller.task.myTask);
  router.post('/api/task/batchadd', controller.task.addBatchTasks);
  router.post('/api/task/focus', controller.task.setFocus);
  router.post('/api/task/focuslist', controller.task.getFocusList);
  router.post('/api/task/addleadcomment', controller.task.addLeadComment);
  router.post('/api/task/updateleadcomment', controller.task.updateLeadComment);
  router.post('/api/subtask/add', controller.task.addChildTask);
  router.post('/api/subtask/update', controller.task.updateSubTask);
  router.delete('/api/subtask/delete', controller.task.deleteSubTask);
  router.post('/api/task/export', controller.task.exportAsExcel);

  router.post('/api/login', controller.role.login);
  router.post('/api/modifypwd', controller.role.modifypwd);
  router.post('/api/createaccount', controller.role.createaccount);
  router.post('/api/userlist', controller.role.getUserList);
  router.post('/api/userdelete', controller.role.deleteUser);
  router.post('/api/userupdate', controller.role.updateUser);

  router.post('/api/chart/pie', controller.charts.getPieChart);
  router.post('/api/chart/sort', controller.charts.getSectionTaskSort);
  router.post('/api/chart/finishprocess', controller.charts.getFinishProcess);

};
